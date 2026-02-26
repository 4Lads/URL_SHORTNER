import pool from '../config/database';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: string;
  currency: string;
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  canceled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface CreateSubscriptionData {
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  currency: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export class SubscriptionModel {
  static async create(data: CreateSubscriptionData): Promise<Subscription> {
    const query = `
      INSERT INTO subscriptions (user_id, plan_id, stripe_subscription_id, stripe_customer_id,
        status, currency, current_period_start, current_period_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [
      data.userId, data.planId, data.stripeSubscriptionId, data.stripeCustomerId,
      data.status, data.currency, data.currentPeriodStart, data.currentPeriodEnd,
    ]);
    return result.rows[0];
  }

  static async findByUserId(userId: string): Promise<Subscription | null> {
    const query = `
      SELECT * FROM subscriptions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async findActiveByUserId(userId: string): Promise<Subscription | null> {
    const query = `
      SELECT * FROM subscriptions
      WHERE user_id = $1 AND status IN ('active', 'past_due', 'trialing')
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async findByStripeSubscriptionId(stripeSubId: string): Promise<Subscription | null> {
    const query = 'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1';
    const result = await pool.query(query, [stripeSubId]);
    return result.rows[0] || null;
  }

  static async updateByStripeSubscriptionId(
    stripeSubId: string,
    data: Partial<{
      status: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      canceledAt: Date | null;
    }>
  ): Promise<void> {
    const sets: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.status !== undefined) {
      sets.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.currentPeriodStart !== undefined) {
      sets.push(`current_period_start = $${paramIndex++}`);
      values.push(data.currentPeriodStart);
    }
    if (data.currentPeriodEnd !== undefined) {
      sets.push(`current_period_end = $${paramIndex++}`);
      values.push(data.currentPeriodEnd);
    }
    if (data.cancelAtPeriodEnd !== undefined) {
      sets.push(`cancel_at_period_end = $${paramIndex++}`);
      values.push(data.cancelAtPeriodEnd);
    }
    if (data.canceledAt !== undefined) {
      sets.push(`canceled_at = $${paramIndex++}`);
      values.push(data.canceledAt);
    }

    if (sets.length === 0) return;

    values.push(stripeSubId);
    const query = `UPDATE subscriptions SET ${sets.join(', ')} WHERE stripe_subscription_id = $${paramIndex}`;
    await pool.query(query, values);
  }
}
