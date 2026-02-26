import api from './api';
import { ShortUrl, CreateUrlData, UpdateUrlData } from '../store/urlStore';

export interface UrlResponse {
  success: boolean;
  data: ShortUrl;
}

export interface UrlListResponse {
  success: boolean;
  data: {
    urls: ShortUrl[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ShortenResponse {
  success: boolean;
  data: {
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    createdAt: string;
  };
}

export const urlService = {
  /**
   * Get all URLs for authenticated user
   */
  getAll: async (page = 1, limit = 10): Promise<UrlListResponse> => {
    return api.get('/urls', { params: { page, limit } });
  },

  /**
   * Get single URL by ID
   */
  getById: async (id: string): Promise<UrlResponse> => {
    return api.get(`/urls/${id}`);
  },

  /**
   * Create a new short URL (authenticated or anonymous)
   */
  create: async (data: CreateUrlData): Promise<UrlResponse> => {
    return api.post('/urls', data);
  },

  /**
   * Shorten URL (anonymous endpoint)
   */
  shorten: async (url: string, customAlias?: string): Promise<ShortenResponse> => {
    return api.post('/shorten', { url, customAlias });
  },

  /**
   * Update URL
   */
  update: async (id: string, data: UpdateUrlData): Promise<UrlResponse> => {
    return api.put(`/urls/${id}`, data);
  },

  /**
   * Delete URL
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/urls/${id}`);
  },

  /**
   * Get URL analytics
   */
  getAnalytics: async (id: string, timeRange = '7d'): Promise<any> => {
    return api.get(`/analytics/${id}`, { params: { timeRange } });
  },

  /**
   * Export analytics
   */
  exportAnalytics: async (id: string, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> => {
    const response = await api.get(`/analytics/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },
};
