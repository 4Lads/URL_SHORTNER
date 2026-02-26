import pool from '../config/database';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_usd_cents: number;
  price_inr_cents: number;
  stripe_price_id_usd: string | null;
  stripe_price_id_inr: string | null;
  max_links_per_month: number;
  analytics_retention_days: number;
  custom_domains: boolean;
  password_protected_links: boolean;
  custom_qr_codes: boolean;
  csv_export: boolean;
  api_rate_limit: number;
  created_at: Date;
}

export class PlanModel {
  static async findAll(): Promise<Plan[]> {
    const result = await pool.query('SELECT * FROM plans ORDER BY price_usd_cents ASC');
    return result.rows;
  }

  static async findById(id: string): Promise<Plan | null> {
    const result = await pool.query('SELECT * FROM plans WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getStripePriceId(planId: string, currency: string): Promise<string | null> {
    const plan = await PlanModel.findById(planId);
    if (!plan) return null;
    return currency === 'inr' ? plan.stripe_price_id_inr : plan.stripe_price_id_usd;
  }

  static async updateStripePriceIds(
    planId: string,
    priceIdUsd: string,
    priceIdInr: string
  ): Promise<void> {
    await pool.query(
      'UPDATE plans SET stripe_price_id_usd = $1, stripe_price_id_inr = $2 WHERE id = $3',
      [priceIdUsd, priceIdInr, planId]
    );
  }
}
