import {
  CheckCircle2,
  Clock,
  Flag,
  LayoutDashboard,
  ListTodo,
  LogIn,
  LogOut,
  Settings,
  X,
} from 'lucide-react';
import type { NavSection } from '../types/task';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
    highPriority: number;
  };
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  user: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
  isDemoMode: boolean;
  onSignInGoogle: () => void;
  onSignOut: () => void;
}

export function Sidebar({
  activeSection,
  onSelectSection,
  counts,
  isMobileOpen,
  onCloseMobile,
  user,
  isDemoMode,
  onSignInGoogle,
  onSignOut,
}: SidebarProps) {
  const navItems: {
    id: NavSection;
    label: string;
    icon: typeof LayoutDashboard;
    count?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all', label: 'All Tasks', icon: ListTodo, count: counts.all },
    { id: 'pending', label: 'Pending Tasks', icon: Clock, count: counts.pending },
    { id: 'completed', label: 'Completed Tasks', icon: CheckCircle2, count: counts.completed },
    { id: 'priority', label: 'Priority Tasks', icon: Flag, count: counts.highPriority },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      {/* Logo Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 shrink-0">
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('dashboard');
          }}
          className="flex items-center gap-2.5 text-[#1E293B] font-bold text-lg tracking-tight whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white shrink-0">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </span>
          <span>TaskFlow</span>
        </a>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Primary navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-50 text-[#4F46E5]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E293B]'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.count === 'number' && (
                <span
                  className={`text-xs font-mono tabular-nums ml-2 ${
                    isActive ? 'text-[#4F46E5] font-semibold' : 'text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Account / Storage Footer */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User profile'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center text-xs font-semibold shrink-0">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#1E293B] truncate">
                  {user.displayName || 'Signed-in User'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-[#1E293B]">
                {isDemoMode ? 'Local Demo Workspace' : 'Cloud Sync Off'}
              </p>
              <p className="text-slate-500 mt-0.5 leading-snug">
                Sign in with Google to sync tasks to Firestore.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignInGoogle}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Slide-over Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden flex"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseMobile();
          }}
        >
          <div className="fixed inset-0 bg-slate-900/40" aria-hidden="true" onClick={onCloseMobile} />
          <div className="relative z-10 flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
