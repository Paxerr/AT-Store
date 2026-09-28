import { ShopSettings } from '@/types/settings';
import { SettingsRepository } from '@/repositories/settingsRepository';

export interface VietQrData {
  qr_url: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  amount: number;
  order_id: string;
  payment_memo: string;
}

export class PaymentService {
  private settingsRepo: SettingsRepository;

  constructor() {
    this.settingsRepo = new SettingsRepository();
  }

  public async generateVietQr(orderId: string, amount: number): Promise<VietQrData> {
    const settings = await this.settingsRepo.getSettings();

    const bankCode = settings.BANK_CODE || 'MB';
    const accNumber = settings.BANK_ACCOUNT_NUMBER || '090123456789';
    const accName = encodeURIComponent(settings.BANK_ACCOUNT_NAME || 'NGUYEN ANH THU');
    const memo = encodeURIComponent(orderId);

    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accNumber}-compact2.png?amount=${amount}&addInfo=${memo}&accountName=${accName}`;

    return {
      qr_url: qrUrl,
      bank_name: settings.BANK_NAME || 'MBBank',
      bank_account_number: accNumber,
      bank_account_name: settings.BANK_ACCOUNT_NAME || 'NGUYEN ANH THU',
      amount,
      order_id: orderId,
      payment_memo: orderId,
    };
  }
}
