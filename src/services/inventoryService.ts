import { InventoryRepository } from '@/repositories/inventoryRepository';
import { ProductRepository } from '@/repositories/productRepository';
import { Inventory, InventoryLog } from '@/types/inventory';

export class InventoryService {
  private inventoryRepo: InventoryRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.inventoryRepo = new InventoryRepository();
    this.productRepo = new ProductRepository();
  }

  public async getVariantStock(variantId: string) {
    return this.inventoryRepo.getVariantStock(variantId);
  }

  public async reserveItems(items: { variant_id: string; quantity: number }[]): Promise<{
    success: boolean;
    failedVariantId?: string;
  }> {
    const reserved: { variant_id: string; quantity: number }[] = [];

    for (const item of items) {
      const ok = await this.inventoryRepo.reserveStock(item.variant_id, item.quantity);
      if (!ok) {
        // Rollback already reserved items in this order
        for (const r of reserved) {
          await this.inventoryRepo.releaseStock(r.variant_id, r.quantity);
        }
        return { success: false, failedVariantId: item.variant_id };
      }
      reserved.push(item);
    }

    return { success: true };
  }

  public async releaseItems(items: { variant_id: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      await this.inventoryRepo.releaseStock(item.variant_id, item.quantity);
    }
  }

  public async finalizeItems(items: { variant_id: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      await this.inventoryRepo.finalizeStock(item.variant_id, item.quantity);
    }
  }

  public async adjustStock(
    variantId: string,
    delta: number,
    changeType: InventoryLog['change_type'],
    reason: string,
    userId: string
  ): Promise<boolean> {
    return this.inventoryRepo.adjustStock(variantId, delta, changeType, reason, userId);
  }

  public async getAllInventoryStatus(): Promise<Inventory[]> {
    const products = await this.productRepo.getAllProducts();
    const inventoryList: Inventory[] = [];

    for (const p of products) {
      for (const v of p.variants || []) {
        const stockInfo = await this.inventoryRepo.getVariantStock(v.variant_id);
        inventoryList.push({
          inventory_id: `inv_${v.variant_id}`,
          variant_id: v.variant_id,
          stock: stockInfo.stock,
          reserved_stock: stockInfo.reserved_stock,
          available_stock: stockInfo.available_stock,
          low_stock_threshold: 2,
          updated_at: new Date().toISOString(),
          product_name: p.name,
          sku: v.sku,
          size: v.size,
          color: v.color,
        });
      }
    }

    return inventoryList;
  }

  public async getInventoryLogs(variantId?: string): Promise<InventoryLog[]> {
    return this.inventoryRepo.getInventoryLogs(variantId);
  }
}
