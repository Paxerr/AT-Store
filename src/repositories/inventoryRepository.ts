import { IInventoryRepository } from './interfaces';
import { InventoryLog } from '@/types/inventory';
import { DataStore } from './dataStore';
import { GoogleSheetsClient } from './googleSheetsClient';

export class InventoryRepository implements IInventoryRepository {
  private store = DataStore.getInstance();
  private sheetsClient = GoogleSheetsClient.getInstance();

  public async getVariantStock(
    variantId: string
  ): Promise<{ stock: number; reserved_stock: number; available_stock: number }> {
    const variant = this.store.getVariants().find((v) => v.variant_id === variantId);
    if (!variant) {
      return { stock: 0, reserved_stock: 0, available_stock: 0 };
    }
    const available = Math.max(0, variant.stock - (variant.reserved_stock || 0));
    return {
      stock: variant.stock,
      reserved_stock: variant.reserved_stock || 0,
      available_stock: available,
    };
  }

  public async reserveStock(variantId: string, quantity: number): Promise<boolean> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const variant = raw.variants.find((v) => v.variant_id === variantId);
      if (!variant) return false;

      const available = variant.stock - (variant.reserved_stock || 0);
      if (available < quantity) {
        return false; // Insufficient stock
      }

      variant.reserved_stock = (variant.reserved_stock || 0) + quantity;
      return true;
    });
  }

  public async releaseStock(variantId: string, quantity: number): Promise<boolean> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const variant = raw.variants.find((v) => v.variant_id === variantId);
      if (!variant) return false;

      variant.reserved_stock = Math.max(0, (variant.reserved_stock || 0) - quantity);
      return true;
    });
  }

  public async finalizeStock(variantId: string, quantity: number): Promise<boolean> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const variant = raw.variants.find((v) => v.variant_id === variantId);
      if (!variant) return false;

      const beforeStock = variant.stock;
      variant.stock = Math.max(0, variant.stock - quantity);
      variant.reserved_stock = Math.max(0, (variant.reserved_stock || 0) - quantity);

      // Create log
      const log: InventoryLog = {
        log_id: `inv_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        variant_id: variantId,
        change_type: 'SALE',
        quantity_change: -quantity,
        before_stock: beforeStock,
        after_stock: variant.stock,
        reason: 'Đơn hàng hoàn tất / giao thành công',
        user_id: 'System',
        created_at: new Date().toISOString(),
      };
      raw.inventoryLogs.unshift(log);

      return true;
    });
  }

  public async adjustStock(
    variantId: string,
    delta: number,
    changeType: InventoryLog['change_type'],
    reason: string,
    userId: string
  ): Promise<boolean> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const variant = raw.variants.find((v) => v.variant_id === variantId);
      if (!variant) return false;

      const beforeStock = variant.stock;
      const newStock = Math.max(0, variant.stock + delta);
      variant.stock = newStock;

      const log: InventoryLog = {
        log_id: `inv_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        variant_id: variantId,
        change_type: changeType,
        quantity_change: delta,
        before_stock: beforeStock,
        after_stock: newStock,
        reason,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      raw.inventoryLogs.unshift(log);

      // Write to Google Sheets if configured
      if (this.sheetsClient.isReady()) {
        this.sheetsClient.appendRow('InventoryLogs', [
          log.log_id,
          log.variant_id,
          log.change_type,
          log.quantity_change,
          log.before_stock,
          log.after_stock,
          log.reason,
          log.user_id,
          log.created_at,
        ]);
      }

      return true;
    });
  }

  public async getInventoryLogs(variantId?: string): Promise<InventoryLog[]> {
    const logs = this.store.getInventoryLogs();
    if (variantId) {
      return logs.filter((l) => l.variant_id === variantId);
    }
    return logs;
  }
}
