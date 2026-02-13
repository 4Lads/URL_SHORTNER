import api from './api';

export interface AnalyticsData {
  urlId: string;
  shortCode: string;
  range: string;
  startDate: string;
  endDate: string;
  summary: {
    totalClicks: number;
    uniqueVisitors: number;
    avgClicksPerDay: number;
  };
  clicksOverTime: Array<{
    date: string;
    clicks: number;
  }>;
  deviceStats: Array<{
    device_type: string;
    clicks: number;
  }>;
  browserStats: Array<{
    browser: string;
    clicks: number;
  }>;
  countryStats: Array<{
    country: string;
    clicks: number;
  }>;
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

export const analyticsService = {
  /**
   * Get analytics for a URL
   */
  getAnalytics: async (
    id: string,
    params?: {
      range?: '7d' | '30d' | '90d' | 'all';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AnalyticsResponse> => {
    return api.get(`/analytics/${id}`, { params });
  },

  /**
   * Export analytics as CSV
   */
  exportAnalytics: async (id: string): Promise<Blob> => {
    const response = await api.get(`/analytics/${id}/export`, {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },
};
