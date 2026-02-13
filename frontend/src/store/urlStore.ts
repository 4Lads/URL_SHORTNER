import { create } from 'zustand';

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

export const useUrlStore = create<UrlState>((set, get) => ({
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

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/urls?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }

      const data = await response.json();

      if (data.success && data.data) {
        set({
          urls: data.data.urls.map(transformUrl),
          pagination: data.data.pagination,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch URLs';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createUrl: async (data: CreateUrlData) => {
    try {
      set({ isLoading: true, error: null });

      const token = localStorage.getItem('token');
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create URL');
      }

      const responseData = await response.json();

      if (responseData.success && responseData.data) {
        // Add new URL to the beginning of the list
        const newUrl = transformUrl(responseData.data);
        set((state) => ({
          urls: [newUrl, ...state.urls],
        }));

        return newUrl;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create URL';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUrl: async (id: string, data: UpdateUrlData) => {
    try {
      set({ isLoading: true, error: null });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/urls/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update URL');
      }

      const responseData = await response.json();

      if (responseData.success && responseData.data) {
        // Update URL in the list
        const updatedUrl = transformUrl(responseData.data);
        set((state) => ({
          urls: state.urls.map((url) =>
            url.id === id ? updatedUrl : url
          ),
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update URL';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteUrl: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/urls/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete URL');
      }

      // Remove URL from the list
      set((state) => ({
        urls: state.urls.filter((url) => url.id !== id),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete URL';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUrlById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/urls/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URL');
      }

      const data = await response.json();

      if (data.success && data.data) {
        set({ currentUrl: transformUrl(data.data) });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch URL';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
