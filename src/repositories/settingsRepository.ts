import { ISettingsRepository } from './interfaces';
import { ShopSettings } from '@/types/settings';
import { DataStore } from './dataStore';

export class SettingsRepository implements ISettingsRepository {
  private store = DataStore.getInstance();

  public async getSettings(): Promise<ShopSettings> {
    return this.store.getSettings();
  }

  public async updateSettings(settings: Partial<ShopSettings>): Promise<ShopSettings> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      raw.settings = {
        ...raw.settings,
        ...settings,
      };

      raw.activityLogs.unshift({
        log_id: `act_${Date.now()}`,
        user_id: 'Admin',
        action: 'UPDATE',
        entity: 'SETTINGS',
        entity_id: 'GLOBAL_SETTINGS',
        reason: 'Cập nhật cấu hình cửa hàng & thông tin thanh toán',
        created_at: new Date().toISOString(),
      });

      return raw.settings;
    });
  }
}
