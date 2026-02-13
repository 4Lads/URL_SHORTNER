import { query } from '../config/database';
import { URL } from '../types';

export class UrlModel {
  /**
   * Create a new URL shortening entry
   */
  static async create(data: {
    shortCode: string;
    originalUrl: string;
    userId?: string;
    customAlias?: string;
    title?: string;
    expiresAt?: Date;
  }): Promise<URL> {
    const sql = `
      INSERT INTO urls (short_code, original_url, user_id, custom_alias, title, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.shortCode,
      data.originalUrl,
      data.userId || null,
      data.customAlias || null,
      data.title || null,
      data.expiresAt || null,
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Find URL by short code
   */
  static async findByShortCode(shortCode: string): Promise<URL | null> {
    const sql = `
      SELECT * FROM urls
      WHERE short_code = $1 AND is_active = true
    `;

    const result = await query(sql, [shortCode]);
    return result.rows[0] || null;
  }

  /**
   * Check if short code exists
   */
  static async existsByShortCode(shortCode: string): Promise<boolean> {
    const sql = `
      SELECT EXISTS(SELECT 1 FROM urls WHERE short_code = $1)
    `;

    const result = await query(sql, [shortCode]);
    return result.rows[0].exists;
  }

  /**
   * Increment click count
   */
  static async incrementClickCount(urlId: string): Promise<void> {
    const sql = `
      UPDATE urls
      SET click_count = click_count + 1
      WHERE id = $1
    `;

    await query(sql, [urlId]);
  }

  /**
   * Find URL by ID
   */
  static async findById(id: string): Promise<URL | null> {
    const sql = `
      SELECT * FROM urls
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find all URLs by user ID
   */
  static async findByUserId(userId: string, limit = 10, offset = 0): Promise<URL[]> {
    const sql = `
      SELECT * FROM urls
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Count URLs by user ID
   */
  static async countByUserId(userId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count FROM urls
      WHERE user_id = $1
    `;

    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Update URL
   */
  static async update(id: string, data: {
    title?: string;
    isActive?: boolean;
    expiresAt?: string | null;
  }): Promise<URL> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }

    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive);
    }

    if (data.expiresAt !== undefined) {
      updates.push(`expires_at = $${paramIndex++}`);
      values.push(data.expiresAt);
    }

    if (updates.length === 0) {
      // No updates, return existing record
      return (await this.findById(id))!;
    }

    values.push(id);

    const sql = `
      UPDATE urls
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }
}
