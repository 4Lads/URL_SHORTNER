import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ModalType = 'createUrl' | 'editUrl' | 'deleteConfirm' | 'qrCode';

interface ModalState {
  [key: string]: boolean;
}

interface UiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modals: ModalState;
  activeModal: ModalType | null;
  modalData: any;

  // Theme actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Sidebar actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Modal actions
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: (modal: ModalType) => void;
  closeAllModals: () => void;
  setModalData: (data: any) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: true,
      modals: {
        createUrl: false,
        editUrl: false,
        deleteConfirm: false,
        qrCode: false,
      },
      activeModal: null,
      modalData: null,

      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      openModal: (modal, data = null) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
          activeModal: modal,
          modalData: data,
        })),

      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
          activeModal: state.activeModal === modal ? null : state.activeModal,
          modalData: state.activeModal === modal ? null : state.modalData,
        })),

      closeAllModals: () =>
        set({
          modals: {
            createUrl: false,
            editUrl: false,
            deleteConfirm: false,
            qrCode: false,
          },
          activeModal: null,
          modalData: null,
        }),

      setModalData: (data) => set({ modalData: data }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Initialize theme on app load
if (typeof window !== 'undefined') {
  const store = useUiStore.getState();
  store.setTheme(store.theme);
}
