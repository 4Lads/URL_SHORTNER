import { query } from '../config/database';

export interface Click {
  id: string;
  url_id: string;
  clicked_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  referrer: string | null;
}

export interface ClicksOverTime {
  date: string;
  clicks: number;
}

export interface DeviceStats {
  device_type: string;
  clicks: number;
}

export interface BrowserStats {
  browser: string;
  clicks: number;
}

export interface CountryStats {
  country: string;
  clicks: number;
}

export interface ReferrerStats {
  referrer: string;
  clicks: number;
}

export class ClickModel {
  /**
   * Record a click for a URL
   */
  static async create(data: {
    urlId: string;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    deviceType?: string;
    browser?: string;
    referrer?: string;
  }): Promise<Click> {
    const sql = `
      INSERT INTO clicks (
        url_id, ip_address, user_agent, country, city,
        device_type, browser, referrer
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      data.urlId,
      data.ipAddress || null,
      data.userAgent || null,
      data.country || null,
      data.city || null,
      data.deviceType || null,
      data.browser || null,
      data.referrer || null,
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Get clicks over time for a URL
   */
  static async getClicksOverTime(
    urlId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ClicksOverTime[]> {
    const sql = `
      SELECT
        DATE(clicked_at) as date,
        COUNT(*) as clicks
      FROM clicks
      WHERE url_id = $1
        AND clicked_at >= $2
        AND clicked_at <= $3
      GROUP BY DATE(clicked_at)
      ORDER BY date ASC
    `;

    const result = await query(sql, [urlId, startDate, endDate]);
    return result.rows.map(row => ({
      date: row.date,
      clicks: parseInt(row.clicks),
    }));
  }

  /**
   * Get device breakdown for a URL
   */
  static async getDeviceStats(
    urlId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DeviceStats[]> {
    let sql = `
      SELECT
        COALESCE(device_type, 'Unknown') as device_type,
        COUNT(*) as clicks
      FROM clicks
      WHERE url_id = $1
    `;

    const values: any[] = [urlId];

    if (startDate && endDate) {
      sql += ` AND clicked_at >= $2 AND clicked_at <= $3`;
      values.push(startDate, endDate);
    }

    sql += `
      GROUP BY device_type
      ORDER BY clicks DESC
    `;

    const result = await query(sql, values);
    return result.rows.map(row => ({
      device_type: row.device_type,
      clicks: parseInt(row.clicks),
    }));
  }

  /**
   * Get browser breakdown for a URL
   */
  static async getBrowserStats(
    urlId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BrowserStats[]> {
    let sql = `
      SELECT
        COALESCE(browser, 'Unknown') as browser,
        COUNT(*) as clicks
      FROM clicks
      WHERE url_id = $1
    `;

    const values: any[] = [urlId];

    if (startDate && endDate) {
      sql += ` AND clicked_at >= $2 AND clicked_at <= $3`;
      values.push(startDate, endDate);
    }

    sql += `
      GROUP BY browser
      ORDER BY clicks DESC
    `;

    const result = await query(sql, values);
    return result.rows.map(row => ({
      browser: row.browser,
      clicks: parseInt(row.clicks),
    }));
  }

  /**
   * Get country breakdown for a URL
   */
  static async getCountryStats(
    urlId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CountryStats[]> {
    let sql = `
      SELECT
        COALESCE(country, 'Unknown') as country,
        COUNT(*) as clicks
      FROM clicks
      WHERE url_id = $1
    `;

    const values: any[] = [urlId];

    if (startDate && endDate) {
      sql += ` AND clicked_at >= $2 AND clicked_at <= $3`;
      values.push(startDate, endDate);
    }

    sql += `
      GROUP BY country
      ORDER BY clicks DESC
      LIMIT 10
    `;

    const result = await query(sql, values);
    return result.rows.map(row => ({
      country: row.country,
      clicks: parseInt(row.clicks),
    }));
  }

  /**
   * Get total clicks for a URL
   */
  static async getTotalClicks(
    urlId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    let sql = `
      SELECT COUNT(*) as total
      FROM clicks
      WHERE url_id = $1
    `;

    const values: any[] = [urlId];

    if (startDate && endDate) {
      sql += ` AND clicked_at >= $2 AND clicked_at <= $3`;
      values.push(startDate, endDate);
    }

    const result = await query(sql, values);
    return parseInt(result.rows[0].total);
  }

  /**
   * Get unique visitors (by IP) for a URL
   */
  static async getUniqueVisitors(
    urlId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    let sql = `
      SELECT COUNT(DISTINCT ip_address) as unique_visitors
      FROM clicks
      WHERE url_id = $1 AND ip_address IS NOT NULL
    `;

    const values: any[] = [urlId];

    if (startDate && endDate) {
      sql += ` AND clicked_at >= $2 AND clicked_at <= $3`;
      values.push(startDate, endDate);
    }

    const result = await query(sql, values);
    return parseInt(result.rows[0].unique_visitors || 0);
  }

  /**
   * Get top referrers for a URL
   */
  static async getTopReferrers(
    urlId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReferrerStats[]> {
    let sql = `
      SELECT
        COALESCE(referrer, 'Direct/Unknown') as referrer,
        COUNT(*) as clicks
      FROM clicks
      WHERE url_id = $1
    `;

    const values: any[] = [urlId];

    if (startDate && endDate) {
      sql += ` AND clicked_at >= $2 AND clicked_at <= $3`;
      values.push(startDate, endDate);
    }

    sql += `
      GROUP BY referrer
      ORDER BY clicks DESC
      LIMIT 20
    `;

    const result = await query(sql, values);
    return result.rows.map(row => ({
      referrer: row.referrer,
      clicks: parseInt(row.clicks),
    }));
  }
}
