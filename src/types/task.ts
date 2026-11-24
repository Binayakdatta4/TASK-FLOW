export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD or ""
  completed: boolean;
  userId: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

export type TaskFilter = 'all' | 'pending' | 'completed' | 'High' | 'Medium' | 'Low';

export type TaskSort = 'newest' | 'oldest' | 'dueDate';

export type NavSection = 'dashboard' | 'all' | 'pending' | 'completed' | 'priority' | 'settings';

export interface AppSettings {
  defaultPriority: TaskPriority;
  defaultSort: TaskSort;
  confirmBeforeDelete: boolean;
  showCompletedInDashboard: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
