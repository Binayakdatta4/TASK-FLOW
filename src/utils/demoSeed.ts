import type { AppSettings, TaskItem } from '../types/task';
import { getLocalTodayIso } from './taskUtils';

const DEMO_TASKS_STORAGE_KEY = 'taskflow_demo_tasks_v1';
const SETTINGS_STORAGE_KEY = 'taskflow_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  defaultPriority: 'Medium',
  defaultSort: 'newest',
  confirmBeforeDelete: true,
  showCompletedInDashboard: true,
};

function offsetDateIso(daysOffset: number): string {
  const base = new Date();
  base.setDate(base.getDate() + daysOffset);
  return getLocalTodayIso(base);
}

export function createInitialDemoTasks(): TaskItem[] {
  const now = Date.now();
  return [
    {
      id: 'demo-task-1',
      title: 'Complete DBMS Assignment',
      description: 'Finish ER normalization diagrams and SQL query optimization section before submission.',
      priority: 'High',
      dueDate: offsetDateIso(2),
      completed: false,
      userId: 'demo-user',
      createdAtMs: now - 3600_000 * 2,
      updatedAtMs: now - 3600_000 * 2,
    },
    {
      id: 'demo-task-2',
      title: 'Review Sprint Design Specs',
      description: 'Audit spacing, keyboard focus rings, and responsive breakpoints for Q4 dashboard release.',
      priority: 'Medium',
      dueDate: offsetDateIso(-2),
      completed: false,
      userId: 'demo-user',
      createdAtMs: now - 3600_000 * 6,
      updatedAtMs: now - 3600_000 * 6,
    },
    {
      id: 'demo-task-3',
      title: 'Prepare Weekly Team Standup Notes',
      description: 'Summarize completed milestones and highlight upcoming blockers for Tuesday sync.',
      priority: 'Low',
      dueDate: offsetDateIso(5),
      completed: false,
      userId: 'demo-user',
      createdAtMs: now - 3600_000 * 12,
      updatedAtMs: now - 3600_000 * 12,
    },
    {
      id: 'demo-task-4',
      title: 'Configure Firebase Security Rules',
      description: 'Verify owner-only read/write guards and strict schema validation in firestore.rules.',
      priority: 'High',
      dueDate: offsetDateIso(-1),
      completed: true,
      userId: 'demo-user',
      createdAtMs: now - 3600_000 * 24,
      updatedAtMs: now - 3600_000 * 5,
    },
  ];
}

export function loadDemoTasks(): TaskItem[] {
  try {
    const raw = window.localStorage.getItem(DEMO_TASKS_STORAGE_KEY);
    if (!raw) {
      const seed = createInitialDemoTasks();
      window.localStorage.setItem(DEMO_TASKS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fallback to fresh seed if localStorage is unavailable or malformed
  }
  return createInitialDemoTasks();
}

export function saveDemoTasks(tasks: TaskItem[]): void {
  try {
    window.localStorage.setItem(DEMO_TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadAppSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}
