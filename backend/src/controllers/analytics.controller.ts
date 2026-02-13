import { Request, Response } from 'express';
import { ClickModel } from '../models/click.model';
import { UrlModel } from '../models/url.model';
import { z } from 'zod';

// Validation schema for analytics query
const analyticsQuerySchema = z.object({
  range: z.enum(['7d', '30d', '90d', 'all']).optional().default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export class AnalyticsController {
  /**
   * Get analytics for a specific URL
   */
  static async getUrlAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      // Validate query parameters
      const validationResult = analyticsQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid query parameters',
            details: validationResult.error.errors,
          },
        });
        return;
      }

      const { range, startDate: customStartDate, endDate: customEndDate } = validationResult.data;

      // Check if URL exists and user owns it
      const url = await UrlModel.findById(id);

      if (!url) {
        res.status(404).json({
          success: false,
          error: {
            message: 'URL not found',
          },
        });
        return;
      }

      if (url.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
        return;
      }

      // Calculate date range
      const endDate = customEndDate ? new Date(customEndDate) : new Date();
      let startDate: Date;

      if (customStartDate) {
        startDate = new Date(customStartDate);
      } else {
        // Calculate startDate based on range
        const now = new Date();
        switch (range) {
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case 'all':
            startDate = new Date(url.created_at);
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
      }

      // Fetch all analytics data in parallel
      const [
        totalClicks,
        uniqueVisitors,
        clicksOverTime,
        deviceStats,
        browserStats,
        countryStats,
      ] = await Promise.all([
        ClickModel.getTotalClicks(id, startDate, endDate),
        ClickModel.getUniqueVisitors(id, startDate, endDate),
        ClickModel.getClicksOverTime(id, startDate, endDate),
        ClickModel.getDeviceStats(id, startDate, endDate),
        ClickModel.getBrowserStats(id, startDate, endDate),
        ClickModel.getCountryStats(id, startDate, endDate),
      ]);

      res.json({
        success: true,
        data: {
          urlId: id,
          shortCode: url.short_code,
          range,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          summary: {
            totalClicks,
            uniqueVisitors,
            avgClicksPerDay: clicksOverTime.length > 0
              ? Math.round(totalClicks / clicksOverTime.length)
              : 0,
          },
          clicksOverTime,
          deviceStats,
          browserStats,
          countryStats,
        },
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch analytics',
        },
      });
    }
  }

  /**
   * Export analytics as CSV (Industry Standard Format)
   */
  static async exportAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      // Check if URL exists and user owns it
      const url = await UrlModel.findById(id);

      if (!url) {
        res.status(404).json({
          success: false,
          error: {
            message: 'URL not found',
          },
        });
        return;
      }

      if (url.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
        return;
      }

      // Fetch all analytics data
      const startDate = new Date(url.created_at);
      const endDate = new Date();

      const [
        totalClicks,
        uniqueVisitors,
        clicksOverTime,
        deviceStats,
        browserStats,
        countryStats,
        topReferrers,
      ] = await Promise.all([
        ClickModel.getTotalClicks(id, startDate, endDate),
        ClickModel.getUniqueVisitors(id, startDate, endDate),
        ClickModel.getClicksOverTime(id, startDate, endDate),
        ClickModel.getDeviceStats(id, startDate, endDate),
        ClickModel.getBrowserStats(id, startDate, endDate),
        ClickModel.getCountryStats(id, startDate, endDate),
        ClickModel.getTopReferrers(id, startDate, endDate),
      ]);

      const avgClicksPerDay = clicksOverTime.length > 0
        ? Math.round(totalClicks / clicksOverTime.length)
        : 0;

      // Find peak day
      const peakDay = clicksOverTime.length > 0
        ? clicksOverTime.reduce((max, curr) => curr.clicks > max.clicks ? curr : max)
        : null;

      // Build comprehensive CSV following Bitly/industry standards
      const csvLines: string[] = [];

      // ===== SECTION 1: LINK METADATA =====
      csvLines.push('URL SHORTENER ANALYTICS EXPORT');
      csvLines.push(`Generated,${new Date().toISOString()}`);
      csvLines.push('');

      csvLines.push('LINK INFORMATION');
      csvLines.push(`Short Code,${url.short_code}`);
      csvLines.push(`Short URL,${process.env.BASE_URL || 'http://localhost:3005'}/${url.short_code}`);
      csvLines.push(`Original URL,${url.original_url}`);
      csvLines.push(`Title,${url.title || 'N/A'}`);
      csvLines.push(`Created Date,${new Date(url.created_at).toISOString()}`);
      csvLines.push(`Status,${url.is_active ? 'Active' : 'Inactive'}`);
      csvLines.push(`Expires,${url.expires_at ? new Date(url.expires_at).toISOString() : 'Never'}`);
      csvLines.push('');

      // ===== SECTION 2: SUMMARY STATISTICS =====
      csvLines.push('SUMMARY STATISTICS');
      csvLines.push(`Date Range,${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
      csvLines.push(`Total Clicks,${totalClicks}`);
      csvLines.push(`Unique Visitors,${uniqueVisitors}`);
      csvLines.push(`Average Clicks Per Day,${avgClicksPerDay}`);
      csvLines.push(`Peak Day,${peakDay ? peakDay.date : 'N/A'}`);
      csvLines.push(`Peak Day Clicks,${peakDay ? peakDay.clicks : 0}`);
      csvLines.push(`Days Active,${clicksOverTime.length}`);
      csvLines.push('');

      // ===== SECTION 3: DAILY CLICKS (TIME SERIES) =====
      csvLines.push('DAILY CLICKS');
      csvLines.push('Date,Clicks,Cumulative Total');
      let cumulativeClicks = 0;
      clicksOverTime.forEach(row => {
        cumulativeClicks += row.clicks;
        csvLines.push(`${row.date},${row.clicks},${cumulativeClicks}`);
      });
      csvLines.push('');

      // ===== SECTION 4: DEVICE BREAKDOWN =====
      csvLines.push('DEVICE BREAKDOWN');
      csvLines.push('Device Type,Clicks,Percentage');
      deviceStats.forEach(stat => {
        const percentage = ((stat.clicks / totalClicks) * 100).toFixed(2);
        csvLines.push(`${stat.device_type},${stat.clicks},${percentage}%`);
      });
      csvLines.push('');

      // ===== SECTION 5: BROWSER DISTRIBUTION =====
      csvLines.push('BROWSER DISTRIBUTION');
      csvLines.push('Browser,Clicks,Percentage');
      browserStats.forEach(stat => {
        const percentage = ((stat.clicks / totalClicks) * 100).toFixed(2);
        csvLines.push(`${stat.browser},${stat.clicks},${percentage}%`);
      });
      csvLines.push('');

      // ===== SECTION 6: GEOGRAPHIC DISTRIBUTION =====
      csvLines.push('GEOGRAPHIC DISTRIBUTION');
      csvLines.push('Country,Clicks,Percentage,Rank');
      countryStats.forEach((stat, index) => {
        const percentage = ((stat.clicks / totalClicks) * 100).toFixed(2);
        csvLines.push(`${stat.country},${stat.clicks},${percentage}%,${index + 1}`);
      });
      csvLines.push('');

      // ===== SECTION 7: TOP REFERRERS =====
      csvLines.push('TOP REFERRERS');
      csvLines.push('Referrer,Clicks,Percentage');
      if (topReferrers.length > 0) {
        topReferrers.forEach(stat => {
          const percentage = ((stat.clicks / totalClicks) * 100).toFixed(2);
          const referrer = stat.referrer || 'Direct/Unknown';
          csvLines.push(`"${referrer}",${stat.clicks},${percentage}%`);
        });
      } else {
        csvLines.push('No referrer data available,0,0%');
      }
      csvLines.push('');

      // ===== SECTION 8: EXPORT METADATA =====
      csvLines.push('EXPORT INFORMATION');
      csvLines.push(`Export Format,CSV (Comma-Separated Values)`);
      csvLines.push(`Encoding,UTF-8`);
      csvLines.push(`Total Rows,${csvLines.length}`);
      csvLines.push(`Analytics Platform,Custom URL Shortener v1.0`);

      const csv = csvLines.join('\n');

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="analytics-${url.short_code}-${new Date().toISOString().split('T')[0]}.csv"`
      );

      res.send(csv);
    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to export analytics',
        },
      });
    }
  }
}
