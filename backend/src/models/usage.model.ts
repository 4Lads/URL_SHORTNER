import pool from '../config/database';

export interface UsageTracking {
  id: string;
  user_id: string;
  period_start: Date;
  period_end: Date;
  links_created: number;
  created_at: Date;
  updated_at: Date;
}

export class UsageModel {
  static async getCurrentPeriodUsage(userId: string): Promise<UsageTracking> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Upsert: get existing or create new usage record for current month
    const query = `
      INSERT INTO usage_tracking (user_id, period_start, period_end, links_created)
      VALUES ($1, $2, $3, 0)
      ON CONFLICT (user_id, period_start) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [userId, periodStart, periodEnd]);
    return result.rows[0];
  }

  static async incrementLinksCreated(userId: string): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const query = `
      INSERT INTO usage_tracking (user_id, period_start, period_end, links_created)
      VALUES ($1, $2, $3, 1)
      ON CONFLICT (user_id, period_start)
      DO UPDATE SET links_created = usage_tracking.links_created + 1, updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [userId, periodStart, periodEnd]);
  }
}
