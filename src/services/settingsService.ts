import { SettingsRepository } from '@/repositories/settingsRepository';
import { ShopSettings } from '@/types/settings';
import { settingsSchema } from '@/schemas/settingsSchema';

export class SettingsService {
  private settingsRepo: SettingsRepository;

  constructor() {
    this.settingsRepo = new SettingsRepository();
  }

  public async getSettings(): Promise<ShopSettings> {
    return this.settingsRepo.getSettings();
  }

  public async updateSettings(payload: any): Promise<ShopSettings> {
    const current = await this.settingsRepo.getSettings();
    const merged = { ...current, ...payload };
    const validated = settingsSchema.parse(merged);
    return this.settingsRepo.updateSettings(validated);
  }
}
