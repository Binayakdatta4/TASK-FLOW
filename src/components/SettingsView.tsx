import { Cloud, Database, LogIn, LogOut, RotateCcw } from 'lucide-react';
import type { AppSettings, TaskPriority, TaskSort } from '../types/task';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
  user: {
    displayName: string | null;
    email: string | null;
  } | null;
  isDemoMode: boolean;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onResetDemoTasks: () => void;
}

export function SettingsView({
  settings,
  onUpdateSettings,
  user,
  isDemoMode,
  onSignInGoogle,
  onSignOut,
  onResetDemoTasks,
}: SettingsViewProps) {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Task Defaults */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-[#1E293B]">Workspace Preferences</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure defaults for new tasks, sorting, and deletion behavior.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label htmlFor="settings-default-priority" className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Default Task Priority
            </label>
            <select
              id="settings-default-priority"
              value={settings.defaultPriority}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  defaultPriority: e.target.value as TaskPriority,
                })
              }
              className="w-full h-10 px-3 text-sm font-medium text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="settings-default-sort" className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Default Sort Order
            </label>
            <select
              id="settings-default-sort"
              value={settings.defaultSort}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  defaultSort: e.target.value as TaskSort,
                })
              }
              className="w-full h-10 px-3 text-sm font-medium text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={settings.confirmBeforeDelete}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  confirmBeforeDelete: e.target.checked,
                })
              }
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5]"
            />
            <div>
              <span className="text-sm font-medium text-[#1E293B]">Confirm before deleting tasks</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Show a confirmation dialog before permanently removing a task.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={settings.showCompletedInDashboard}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  showCompletedInDashboard: e.target.checked,
                })
              }
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5]"
            />
            <div>
              <span className="text-sm font-medium text-[#1E293B]">Show Completed section on Dashboard</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Display finished tasks in a dedicated section below pending tasks on the Dashboard.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Firebase Sync & Account */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              {user ? <Cloud className="w-5 h-5" aria-hidden="true" /> : <Database className="w-5 h-5" aria-hidden="true" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1E293B]">
                {user ? 'Firebase Firestore Sync Active' : 'Local Demo Storage'}
              </h2>
              <p className="text-sm text-slate-500">
                {user
                  ? `Signed in as ${user.displayName || user.email}. Tasks sync in real time.`
                  : 'Tasks are currently stored locally in your browser. Sign in with Google to sync to Firebase Firestore.'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          {user ? (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onSignInGoogle}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Sign in with Google</span>
              </button>
              {isDemoMode && (
                <button
                  type="button"
                  onClick={onResetDemoTasks}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Restore Sample Tasks</span>
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
