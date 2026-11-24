import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { CheckCircle2, Database, LogIn, ShieldCheck } from 'lucide-react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { TaskForm } from './components/TaskForm';
import { ToastContainer } from './components/ToastContainer';
import { auth, googleProvider } from './firebase/firebaseConfig';
import {
  clearCompletedTasksInFirestore,
  createTaskInFirestore,
  deleteTaskInFirestore,
  subscribeToUserTasks,
  toggleTaskCompletedInFirestore,
  updateTaskInFirestore,
} from './firebase/taskService';
import type {
  AppSettings,
  NavSection,
  TaskFilter,
  TaskInput,
  TaskItem,
  TaskPriority,
  TaskSort,
  ToastMessage,
} from './types/task';
import {
  createInitialDemoTasks,
  loadAppSettings,
  loadDemoTasks,
  saveAppSettings,
  saveDemoTasks,
} from './utils/demoSeed';

function TaskFlowApp() {
  const initialAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(initialAutostart);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sortBy, setSortBy] = useState<TaskSort>(() => loadAppSettings().defaultSort);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [presetPriority, setPresetPriority] = useState<TaskPriority | null>(null);
  const [isSavingTask, setIsSavingTask] = useState(false);

  const [pendingDeleteTask, setPendingDeleteTask] = useState<TaskItem | null>(null);
  const [isConfirmClearCompletedOpen, setIsConfirmClearCompletedOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Re-throw Firestore errors into ErrorBoundary if fatal
  if (firestoreError) {
    throw firestoreError;
  }

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsDemoMode(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore tasks when signed in, or load local demo tasks when in Demo Mode
  useEffect(() => {
    if (!authReady) return;

    if (user) {
      setIsLoadingTasks(true);
      const unsubscribe = subscribeToUserTasks(
        user.uid,
        (nextTasks) => {
          setTasks(nextTasks);
          setIsLoadingTasks(false);
        },
        (err) => {
          setIsLoadingTasks(false);
          setFirestoreError(err);
        }
      );
      return () => unsubscribe();
    }

    if (isDemoMode) {
      setTasks(loadDemoTasks());
      setIsLoadingTasks(false);
      return;
    }

    setTasks([]);
    setIsLoadingTasks(false);
  }, [authReady, user, isDemoMode]);

  const handleSelectSection = (section: NavSection) => {
    setActiveSection(section);
    if (section === 'pending') {
      setFilter('pending');
    } else if (section === 'completed') {
      setFilter('completed');
    } else if (section === 'all' || section === 'dashboard' || section === 'priority') {
      setFilter('all');
    }
  };

  const handleUpdateSettings = (next: AppSettings) => {
    setSettings(next);
    saveAppSettings(next);
    setSortBy(next.defaultSort);
    addToast('success', 'Settings saved');
  };

  const handleSignInGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addToast('success', 'Signed in with Google', 'Your tasks are now synced with Firebase Firestore.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to sign in with Google.';
      addToast('error', 'Sign-in failed', msg);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsDemoMode(false);
      setTasks([]);
      addToast('info', 'Signed out', 'You have been signed out of your account.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to sign out.';
      addToast('error', 'Sign-out failed', msg);
    }
  };

  const handleEnterDemoMode = () => {
    setIsDemoMode(true);
    setTasks(loadDemoTasks());
    addToast('info', 'Demo workspace active', 'Try creating, editing, completing, or deleting tasks.');
  };

  const handleResetDemoTasks = () => {
    const fresh = createInitialDemoTasks();
    saveDemoTasks(fresh);
    setTasks(fresh);
    addToast('success', 'Sample tasks restored');
  };

  const handleOpenAddModal = (priorityOverride?: TaskPriority) => {
    setEditingTask(null);
    setPresetPriority(priorityOverride || null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setPresetPriority(null);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (input: TaskInput) => {
    setIsSavingTask(true);
    try {
      if (editingTask) {
        if (user) {
          await updateTaskInFirestore(editingTask.id, input);
        } else {
          const updated = tasks.map((t) =>
            t.id === editingTask.id
              ? { ...t, ...input, updatedAtMs: Date.now() }
              : t
          );
          setTasks(updated);
          saveDemoTasks(updated);
        }
        addToast('success', 'Task updated', `"${input.title}" has been saved.`);
      } else {
        if (user) {
          await createTaskInFirestore(user.uid, input);
        } else {
          const now = Date.now();
          const created: TaskItem = {
            id: `demo-${now}-${Math.random().toString(36).slice(2, 6)}`,
            ...input,
            completed: false,
            userId: 'demo-user',
            createdAtMs: now,
            updatedAtMs: now,
          };
          const next = [created, ...tasks];
          setTasks(next);
          saveDemoTasks(next);
        }
        addToast('success', 'Task added', `"${input.title}" was added to your list.`);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      setPresetPriority(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to save task.';
      addToast('error', 'Failed to save task', msg);
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleToggleComplete = async (task: TaskItem) => {
    const nextCompleted = !task.completed;
    try {
      if (user) {
        await toggleTaskCompletedInFirestore(task.id, nextCompleted);
      } else {
        const next = tasks.map((t) =>
          t.id === task.id
            ? { ...t, completed: nextCompleted, updatedAtMs: Date.now() }
            : t
        );
        setTasks(next);
        saveDemoTasks(next);
      }
      addToast(
        'success',
        nextCompleted ? 'Task completed' : 'Task reopened',
        `"${task.title}" marked as ${nextCompleted ? 'completed' : 'pending'}.`
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to update task status.';
      addToast('error', 'Status update failed', msg);
    }
  };

  const executeDeleteTask = async (task: TaskItem) => {
    setIsDeleting(true);
    try {
      if (user) {
        await deleteTaskInFirestore(task.id);
      } else {
        const next = tasks.filter((t) => t.id !== task.id);
        setTasks(next);
        saveDemoTasks(next);
      }
      setPendingDeleteTask(null);
      addToast('success', 'Task deleted', `"${task.title}" was permanently removed.`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to delete task.';
      addToast('error', 'Delete failed', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestDeleteTask = (task: TaskItem) => {
    if (!settings.confirmBeforeDelete) {
      void executeDeleteTask(task);
      return;
    }
    setPendingDeleteTask(task);
  };

  const executeClearCompleted = async () => {
    const completedIds = tasks.filter((t) => t.completed).map((t) => t.id);
    if (completedIds.length === 0) return;

    setIsDeleting(true);
    try {
      if (user) {
        await clearCompletedTasksInFirestore(completedIds);
      } else {
        const next = tasks.filter((t) => !t.completed);
        setTasks(next);
        saveDemoTasks(next);
      }
      setIsConfirmClearCompletedOpen(false);
      addToast(
        'success',
        'Completed tasks cleared',
        `Removed ${completedIds.length} completed ${completedIds.length === 1 ? 'task' : 'tasks'}.`
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to clear completed tasks.';
      addToast('error', 'Clear failed', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-600">Initializing TaskFlow...</p>
        </div>
      </div>
    );
  }

  // Welcome / Sign-In Gate (unless signed in or demo mode started)
  if (!user && !isDemoMode) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">TaskFlow</h1>
              <p className="text-xs text-slate-500">Smart To-Do List Manager</p>
            </div>
          </div>

          <h2 className="mt-6 text-2xl font-bold text-[#1E293B] tracking-tight text-balance">
            Manage Your Tasks Efficiently
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Organize daily deliverables, prioritize urgent work, track due dates, and sync across devices in real time with Firebase Firestore.
          </p>

          <div className="mt-6 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-[#4F46E5] shrink-0" aria-hidden="true" />
              <span>Real-time Firestore persistence with instant UI updates</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" aria-hidden="true" />
              <span>Private per-account security rules enforced on every query</span>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <button
              type="button"
              onClick={handleSignInGoogle}
              className="w-full h-11 inline-flex items-center justify-center gap-2.5 px-4 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={handleEnterDemoMode}
              className="w-full h-11 inline-flex items-center justify-center px-4 text-sm font-medium text-[#1E293B] bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              Preview Demo Workspace
            </button>
          </div>
        </div>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  const sidebarCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    highPriority: tasks.filter((t) => t.priority === 'High' && !t.completed).length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        counts={sidebarCounts}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        user={
          user
            ? {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
              }
            : null
        }
        isDemoMode={isDemoMode}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
      />

      <Dashboard
        activeSection={activeSection}
        tasks={tasks}
        isLoading={isLoadingTasks}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        user={
          user
            ? {
                displayName: user.displayName,
                email: user.email,
              }
            : null
        }
        isDemoMode={isDemoMode}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        onOpenAddModal={handleOpenAddModal}
        onEditTask={handleOpenEditModal}
        onDeleteTask={handleRequestDeleteTask}
        onToggleComplete={handleToggleComplete}
        onClearCompleted={() => setIsConfirmClearCompletedOpen(true)}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        onResetDemoTasks={handleResetDemoTasks}
      />

      <TaskForm
        isOpen={isTaskModalOpen}
        editingTask={editingTask}
        defaultPriority={presetPriority || settings.defaultPriority}
        isSubmitting={isSavingTask}
        onSave={handleSaveTask}
        onCancel={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setPresetPriority(null);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteTask)}
        title="Delete Task"
        description={
          pendingDeleteTask
            ? `Are you sure you want to permanently delete "${pendingDeleteTask.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Task"
        isLoading={isDeleting}
        onConfirm={() => {
          if (pendingDeleteTask) {
            void executeDeleteTask(pendingDeleteTask);
          }
        }}
        onCancel={() => setPendingDeleteTask(null)}
      />

      <ConfirmDialog
        isOpen={isConfirmClearCompletedOpen}
        title="Clear Completed Tasks"
        description={`Permanently delete all ${sidebarCounts.completed} completed ${
          sidebarCounts.completed === 1 ? 'task' : 'tasks'
        }? Pending tasks will not be affected.`}
        confirmLabel="Clear Completed"
        isLoading={isDeleting}
        onConfirm={() => void executeClearCompleted()}
        onCancel={() => setIsConfirmClearCompletedOpen(false)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TaskFlowApp />
    </ErrorBoundary>
  );
}
