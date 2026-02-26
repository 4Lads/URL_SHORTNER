import { create } from 'zustand';
import { billingService, PlanData, SubscriptionData, UsageData } from '../services/billing.service';

interface BillingState {
  plans: PlanData[];
  currentPlan: PlanData | null;
  subscription: SubscriptionData | null;
  usage: UsageData | null;
  isLoading: boolean;
  error: string | null;

  fetchPlans: () => Promise<void>;
  fetchBillingStatus: () => Promise<void>;
  createCheckoutSession: (currency: 'usd' | 'inr') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  clearError: () => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  plans: [],
  currentPlan: null,
  subscription: null,
  usage: null,
  isLoading: false,
  error: null,

  fetchPlans: async () => {
    set({ isLoading: true });
    try {
      const response: any = await billingService.getPlans();
      if (response.success) {
        set({ plans: response.data.plans });
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch plans' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBillingStatus: async () => {
    set({ isLoading: true });
    try {
      const response: any = await billingService.getSubscriptionStatus();
      if (response.success) {
        set({
          currentPlan: response.data.plan,
          subscription: response.data.subscription,
          usage: response.data.usage,
        });
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch billing status' });
    } finally {
      set({ isLoading: false });
    }
  },

  createCheckoutSession: async (currency: 'usd' | 'inr') => {
    set({ isLoading: true });
    try {
      const response: any = await billingService.createCheckoutSession(currency);
      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to create checkout session' });
    } finally {
      set({ isLoading: false });
    }
  },

  openCustomerPortal: async () => {
    set({ isLoading: true });
    try {
      const response: any = await billingService.createPortalSession();
      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to open billing portal' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
