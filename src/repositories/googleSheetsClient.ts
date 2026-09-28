import { google } from 'googleapis';

export class GoogleSheetsClient {
  private static instance: GoogleSheetsClient;
  private sheets: any = null;
  private isConfigured: boolean = false;
  private spreadsheetId: string = '';

  private constructor() {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (sheetId && clientEmail && rawPrivateKey) {
      try {
        const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
        const auth = new google.auth.JWT({
          email: clientEmail,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = google.sheets({ version: 'v4', auth });
        this.spreadsheetId = sheetId;
        this.isConfigured = true;
        console.log('[GoogleSheets] Initialized with Service Account');
      } catch (err) {
        console.error('[GoogleSheets] Failed to initialize Google Auth:', err);
        this.isConfigured = false;
      }
    } else {
      // Offline / Local Store Mode
      this.isConfigured = false;
    }
  }

  public static getInstance(): GoogleSheetsClient {
    if (!GoogleSheetsClient.instance) {
      GoogleSheetsClient.instance = new GoogleSheetsClient();
    }
    return GoogleSheetsClient.instance;
  }

  public isReady(): boolean {
    return this.isConfigured && !!this.sheets && !!this.spreadsheetId;
  }

  public async getRows(sheetName: string): Promise<any[][]> {
    if (!this.isReady()) return [];
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:Z`,
      });
      return response.data.values || [];
    } catch (err) {
      console.error(`[GoogleSheets] Error fetching rows from ${sheetName}:`, err);
      return [];
    }
  }

  public async appendRow(sheetName: string, row: any[]): Promise<boolean> {
    if (!this.isReady()) return false;
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });
      return true;
    } catch (err) {
      console.error(`[GoogleSheets] Error appending row to ${sheetName}:`, err);
      return false;
    }
  }

  public async updateRowByPrimaryKey(
    sheetName: string,
    pkColIndex: number,
    pkValue: string,
    updatedRow: any[]
  ): Promise<boolean> {
    if (!this.isReady()) return false;
    try {
      const rows = await this.getRows(sheetName);
      const targetIndex = rows.findIndex((r) => r[pkColIndex] === pkValue);
      if (targetIndex === -1) return false;

      const rowIndex = targetIndex + 2; // +2 for 1-based indexing and header offset
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRow],
        },
      });
      return true;
    } catch (err) {
      console.error(`[GoogleSheets] Error updating row in ${sheetName}:`, err);
      return false;
    }
  }
}
