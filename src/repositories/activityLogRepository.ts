import { IActivityLogRepository } from './interfaces';
import { ActivityLog } from '@/types/settings';
import { DataStore } from './dataStore';

export class ActivityLogRepository implements IActivityLogRepository {
  private store = DataStore.getInstance();

  public async logActivity(log: Omit<ActivityLog, 'log_id' | 'created_at'>): Promise<void> {
    return this.store.acquireLock(async () => {
      const fullLog: ActivityLog = {
        ...log,
        log_id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        created_at: new Date().toISOString(),
      };
      this.store.getRawData().activityLogs.unshift(fullLog);
    });
  }

  public async getActivityLogs(limit = 100): Promise<ActivityLog[]> {
    return this.store.getActivityLogs().slice(0, limit);
  }
}
