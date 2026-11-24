import { CheckCircle2, ClipboardList, Flag, Menu, Plus, RotateCcw } from 'lucide-react';
import type { AppSettings, NavSection, TaskFilter, TaskItem, TaskPriority, TaskSort } from '../types/task';
import { computeTaskStats, filterTasks, sortTasks } from '../utils/taskUtils';
import { SearchBar } from './SearchBar';
import { SettingsView } from './SettingsView';
import { TaskCard } from './TaskCard';
import { TaskStats } from './TaskStats';

interface DashboardProps {
  activeSection: NavSection;
  tasks: TaskItem[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  sortBy: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  user: {
    displayName: string | null;
    email: string | null;
  } | null;
  isDemoMode: boolean;
  onOpenMobileMenu: () => void;
  onOpenAddModal: (presetPriority?: TaskPriority) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
  onToggleComplete: (task: TaskItem) => void;
  onClearCompleted: () => void;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onResetDemoTasks: () => void;
}

export function Dashboard({
  activeSection,
  tasks,
  isLoading,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  settings,
  onUpdateSettings,
  user,
  isDemoMode,
  onOpenMobileMenu,
  onOpenAddModal,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onClearCompleted,
  onSignInGoogle,
  onSignOut,
  onResetDemoTasks,
}: DashboardProps) {
  const stats = computeTaskStats(tasks);
  const filtered = filterTasks(tasks, searchQuery, filter);
  const sorted = sortTasks(filtered, sortBy);

  const pendingTasks = sorted.filter((t) => !t.completed);
  const completedTasks = sorted.filter((t) => t.completed);

  const sectionHeaders: Record<NavSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Manage Your Tasks Efficiently',
      subtitle: 'Track priorities, upcoming deadlines, and daily progress in one workspace.',
    },
    all: {
      title: 'All Tasks',
      subtitle: 'Complete overview of every pending and completed task.',
    },
    pending: {
      title: 'Pending Tasks',
      subtitle: 'Focus on active deliverables that still need your attention.',
    },
    completed: {
      title: 'Completed Tasks',
      subtitle: 'Review finished work or restore items back to your active queue.',
    },
    priority: {
      title: 'Priority Tasks',
      subtitle: 'Organized by urgency so high-impact tasks stay front and center.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize workspace defaults and manage your Firebase Firestore sync.',
    },
  };

  const currentHeader = sectionHeaders[activeSection];
  const hasActiveSearchOrFilter = searchQuery.trim().length > 0 || filter !== 'all';

  const renderLoadingSkeleton = () => (
    <div className="space-y-3" aria-label="Loading tasks">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-md bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => {
    if (tasks.length === 0) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#1E293B]">No tasks yet</h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
            Your workspace is clear. Add your first task with a priority level and due date to start tracking progress.
          </p>
          <button
            type="button"
            onClick={() => onOpenAddModal()}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Your First Task</span>
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <ClipboardList className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[#1E293B]">No matching tasks</h3>
        <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
          No tasks match your current search query or filter selection. Try adjusting your criteria or add a new task.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {hasActiveSearchOrFilter && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onFilterChange('all');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add New Task</span>
          </button>
        </div>
      </div>
    );
  };

  const renderPriorityView = () => {
    const groups: { priority: TaskPriority; label: string; colorClass: string }[] = [
      { priority: 'High', label: 'High Priority', colorClass: 'text-[#DC2626]' },
      { priority: 'Medium', label: 'Medium Priority', colorClass: 'text-amber-600' },
      { priority: 'Low', label: 'Low Priority', colorClass: 'text-slate-600' },
    ];

    if (sorted.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-8">
        {groups.map((group) => {
          const groupTasks = sorted.filter((t) => t.priority === group.priority);
          if (filter !== 'all' && filter !== 'pending' && filter !== 'completed' && filter !== group.priority) {
            return null;
          }
          return (
            <section key={group.priority} aria-label={group.label} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Flag className={`w-4 h-4 ${group.colorClass}`} aria-hidden="true" />
                  <h2 className="text-base font-semibold text-[#1E293B]">{group.label}</h2>
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    ({groupTasks.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAddModal(group.priority)}
                  className="text-xs font-medium text-[#4F46E5] hover:underline whitespace-nowrap"
                >
                  + Add {group.priority}
                </button>
              </div>

              {groupTasks.length === 0 ? (
                <p className="text-sm text-slate-500 py-3">
                  No {group.priority.toLowerCase()} priority tasks match the current filter.
                </p>
              ) : (
                <div className="space-y-3">
                  {groupTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
  };

  const renderStandardTaskSections = () => {
    if (sorted.length === 0) {
      return renderEmptyState();
    }

    const showPendingSection = filter !== 'completed';
    const showCompletedSection =
      filter !== 'pending' && (activeSection !== 'dashboard' || settings.showCompletedInDashboard || filter === 'completed');

    return (
      <div className="space-y-8">
        {showPendingSection && (
          <section aria-label="Pending tasks" className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-base font-semibold text-[#1E293B]">
                Pending Tasks{' '}
                <span className="text-xs font-mono tabular-nums font-medium text-slate-400 ml-1">
                  ({pendingTasks.length})
                </span>
              </h2>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-500">
                  All matching tasks are completed. Great work!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {showCompletedSection && (
          <section aria-label="Completed tasks" className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                <span>Completed Tasks</span>
                <span className="text-xs font-mono tabular-nums font-medium text-slate-400">
                  ({completedTasks.length})
                </span>
              </h2>
            </div>

            {completedTasks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-500">No completed tasks to show yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col min-h-screen">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-[#1E293B] hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="text-sm font-medium text-slate-500 truncate">
            TaskFlow / <span className="text-[#1E293B] font-semibold">{currentHeader.title}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!user && isDemoMode && (
            <button
              type="button"
              onClick={onSignInGoogle}
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Demo Mode · Sync with Google
            </button>
          )}
          {activeSection !== 'settings' && (
            <button
              type="button"
              onClick={() => onOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>New Task</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl w-full mx-auto space-y-6">
        {/* Welcome / Section Heading */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight text-balance">
            {currentHeader.title}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500">{currentHeader.subtitle}</p>
        </div>

        {activeSection === 'settings' ? (
          <SettingsView
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            user={user}
            isDemoMode={isDemoMode}
            onSignInGoogle={onSignInGoogle}
            onSignOut={onSignOut}
            onResetDemoTasks={onResetDemoTasks}
          />
        ) : (
          <>
            {activeSection === 'dashboard' && <TaskStats stats={stats} />}

            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              filter={filter}
              onFilterChange={onFilterChange}
              sortBy={sortBy}
              onSortChange={onSortChange}
              completedCount={stats.completed}
              onClearCompleted={onClearCompleted}
              onAddNewTask={() => onOpenAddModal()}
            />

            {isLoading
              ? renderLoadingSkeleton()
              : activeSection === 'priority'
                ? renderPriorityView()
                : renderStandardTaskSections()}
          </>
        )}
      </main>
    </div>
  );
}
