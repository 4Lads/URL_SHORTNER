import pool from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  plan: string;
  stripe_customer_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  plan: string;
  created_at: Date;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(email: string, passwordHash: string): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, password_hash, plan, stripe_customer_id, created_at, updated_at
    `;

    const result = await pool.query(query, [email, passwordHash]);
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, plan, stripe_customer_id, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, plan, stripe_customer_id, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Check if email already exists
   */
  static async existsByEmail(email: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
  }

  /**
   * Update user's updated_at timestamp
   */
  static async updateTimestamp(id: string): Promise<void> {
    const query = `
      UPDATE users
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await pool.query(query, [id]);
  }

  /**
   * Remove sensitive fields from user object
   */
  static sanitize(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      plan: user.plan || 'free',
      created_at: user.created_at,
    };
  }

  static async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    await pool.query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [stripeCustomerId, userId]
    );
  }

  static async updatePlan(userId: string, plan: string): Promise<void> {
    await pool.query(
      'UPDATE users SET plan = $1 WHERE id = $2',
      [plan, userId]
    );
  }

  static async findByStripeCustomerId(customerId: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, plan, stripe_customer_id, created_at, updated_at
      FROM users
      WHERE stripe_customer_id = $1
    `;
    const result = await pool.query(query, [customerId]);
    return result.rows[0] || null;
  }
}
