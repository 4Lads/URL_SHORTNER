import { create } from 'zustand';
import api from '../services/api';

export interface ShortUrl {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  customAlias?: string;
  title?: string;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

// Transform backend response (snake_case) to frontend format (camelCase)
const transformUrl = (backendUrl: any): ShortUrl => ({
  id: backendUrl.id,
  shortCode: backendUrl.short_code || backendUrl.shortCode,
  shortUrl: backendUrl.shortUrl || backendUrl.short_url,
  originalUrl: backendUrl.original_url || backendUrl.originalUrl,
  customAlias: backendUrl.custom_alias || backendUrl.customAlias,
  title: backendUrl.title,
  clickCount: backendUrl.click_count ?? backendUrl.clickCount ?? 0,
  isActive: backendUrl.is_active ?? backendUrl.isActive ?? true,
  createdAt: backendUrl.created_at || backendUrl.createdAt,
  expiresAt: backendUrl.expires_at || backendUrl.expiresAt,
});

export interface CreateUrlData {
  url: string;
  customAlias?: string;
  title?: string;
  expiresAt?: Date;
}

export interface UpdateUrlData {
  title?: string;
  isActive?: boolean;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UrlState {
  urls: ShortUrl[];
  currentUrl: ShortUrl | null;
  pagination: PaginationData;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUrls: (urls: ShortUrl[]) => void;
  setCurrentUrl: (url: ShortUrl | null) => void;
  setPagination: (pagination: PaginationData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchUrls: (page?: number) => Promise<void>;
  createUrl: (data: CreateUrlData) => Promise<ShortUrl>;
  updateUrl: (id: string, data: UpdateUrlData) => Promise<void>;
  deleteUrl: (id: string) => Promise<void>;
  fetchUrlById: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useUrlStore = create<UrlState>((set) => ({
  urls: [],
  currentUrl: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  setUrls: (urls) => set({ urls }),

  setCurrentUrl: (url) => set({ currentUrl: url }),

  setPagination: (pagination) => set({ pagination }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  fetchUrls: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });

      const data: any = await api.get('/urls', { params: { page, limit: 10 } });

      if (data.success && data.data) {
        set({
          urls: data.data.urls.map(transformUrl),
          pagination: data.data.pagination,
        });
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch URLs';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createUrl: async (data: CreateUrlData) => {
    try {
      set({ isLoading: true, error: null });

      const responseData: any = await api.post('/urls', data);

      if (responseData.success && responseData.data) {
        const newUrl = transformUrl(responseData.data);
        set((state) => ({
          urls: [newUrl, ...state.urls],
        }));

        return newUrl;
      }

      throw new Error('Invalid response format');
    } catch (error: any) {
      const message = error?.message || 'Failed to create URL';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUrl: async (id: string, data: UpdateUrlData) => {
    try {
      set({ isLoading: true, error: null });

      const responseData: any = await api.put(`/urls/${id}`, data);

      if (responseData.success && responseData.data) {
        const updatedUrl = transformUrl(responseData.data);
        set((state) => ({
          urls: state.urls.map((url) =>
            url.id === id ? updatedUrl : url
          ),
        }));
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to update URL';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteUrl: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await api.delete(`/urls/${id}`);

      set((state) => ({
        urls: state.urls.filter((url) => url.id !== id),
      }));
    } catch (error: any) {
      const message = error?.message || 'Failed to delete URL';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUrlById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const data: any = await api.get(`/urls/${id}`);

      if (data.success && data.data) {
        set({ currentUrl: transformUrl(data.data) });
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch URL';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
