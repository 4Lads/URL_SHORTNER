import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useUiStore } from '../../store/uiStore';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: 'Overview', path: '/dashboard', icon: '📊' },
  { name: 'My Links', path: '/dashboard/links', icon: '🔗' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
];

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUiStore();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)]
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700
          `}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="glass-card dark:glass-dark p-4 rounded-lg">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                💎 Upgrade to Pro
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Unlock advanced analytics and custom domains
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full gradient-primary text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
          aria-label="Toggle sidebar"
        >
          <span className="text-2xl">{sidebarOpen ? '✕' : '☰'}</span>
        </button>
      </div>
    </div>
  );
};
