import api from './api';

export interface PlanData {
  id: string;
  name: string;
  description: string;
  priceUsdCents: number;
  priceInrCents: number;
  maxLinksPerMonth: number;
  analyticsRetentionDays: number;
  customDomains: boolean;
  passwordProtectedLinks: boolean;
  customQrCodes: boolean;
  csvExport: boolean;
  apiRateLimit: number;
}

export interface SubscriptionData {
  id: string;
  planId: string;
  status: string;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface UsageData {
  linksCreated: number;
  linksLimit: number;
  periodStart: string;
  periodEnd: string;
}

export const billingService = {
  getPlans: async (): Promise<any> => {
    return api.get('/billing/plans');
  },

  getSubscriptionStatus: async (): Promise<any> => {
    return api.get('/billing/subscription');
  },

  createCheckoutSession: async (currency: 'usd' | 'inr'): Promise<any> => {
    return api.post('/billing/create-checkout-session', { currency });
  },

  createPortalSession: async (): Promise<any> => {
    return api.post('/billing/create-portal-session');
  },
};
