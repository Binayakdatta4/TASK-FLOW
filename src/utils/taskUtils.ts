import type { TaskFilter, TaskInput, TaskItem, TaskPriority, TaskSort } from '../types/task';

// Constants synchronized verbatim with firebase-blueprint.json & firestore.rules
export const TASK_CONSTRAINTS = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 140,
  DESCRIPTION_MAX_LENGTH: 1000,
  DUE_DATE_MAX_LENGTH: 10,
  DUE_DATE_PATTERN: /^(\d{4}-\d{2}-\d{2})?$/,
  PRIORITIES: ['Low', 'Medium', 'High'] as const,
} as const;

export interface TaskValidationErrors {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
}

export interface TaskValidationResult {
  valid: boolean;
  errors: TaskValidationErrors;
  sanitized: TaskInput;
}

export interface TaskStatsSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export function getLocalTodayIso(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateTaskInput(input: TaskInput): TaskValidationResult {
  const title = input.title.trim();
  const description = input.description.trim();
  const dueDate = input.dueDate.trim();
  const priority = input.priority;

  const errors: TaskValidationErrors = {};

  if (title.length < TASK_CONSTRAINTS.TITLE_MIN_LENGTH) {
    errors.title = 'Task title is required.';
  } else if (title.length > TASK_CONSTRAINTS.TITLE_MAX_LENGTH) {
    errors.title = `Task title must be ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (description.length > TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }

  if (!TASK_CONSTRAINTS.PRIORITIES.includes(priority as TaskPriority)) {
    errors.priority = 'Please choose Low, Medium, or High priority.';
  }

  if (dueDate.length > TASK_CONSTRAINTS.DUE_DATE_MAX_LENGTH || !TASK_CONSTRAINTS.DUE_DATE_PATTERN.test(dueDate)) {
    errors.dueDate = 'Due date must be a valid YYYY-MM-DD date.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      title,
      description,
      priority,
      dueDate,
    },
  };
}

export function isTaskOverdue(
  task: Pick<TaskItem, 'dueDate' | 'completed'>,
  todayIso: string = getLocalTodayIso()
): boolean {
  if (task.completed || !task.dueDate) {
    return false;
  }
  return task.dueDate < todayIso;
}

export function computeTaskStats(
  tasks: readonly TaskItem[],
  todayIso: string = getLocalTodayIso()
): TaskStatsSummary {
  let completed = 0;
  let pending = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed += 1;
    } else {
      pending += 1;
      if (isTaskOverdue(task, todayIso)) {
        overdue += 1;
      }
    }
  }

  return {
    total: tasks.length,
    completed,
    pending,
    overdue,
  };
}

export function filterTasks(
  tasks: readonly TaskItem[],
  searchQuery: string,
  filter: TaskFilter
): TaskItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    if (normalizedQuery) {
      const matchesTitle = task.title.toLowerCase().includes(normalizedQuery);
      if (!matchesTitle) {
        return false;
      }
    }

    switch (filter) {
      case 'all':
        return true;
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'High':
      case 'Medium':
      case 'Low':
        return task.priority === filter;
      default:
        return true;
    }
  });
}

export function sortTasks(tasks: readonly TaskItem[], sortBy: TaskSort): TaskItem[] {
  const copy = [...tasks];

  copy.sort((a, b) => {
    if (sortBy === 'newest') {
      return b.createdAtMs - a.createdAtMs;
    }

    if (sortBy === 'oldest') {
      return a.createdAtMs - b.createdAtMs;
    }

    // sortBy === 'dueDate': tasks with a dueDate come first sorted earliest -> latest,
    // tasks without dueDate come last sorted newest first
    if (a.dueDate && b.dueDate) {
      const cmp = a.dueDate.localeCompare(b.dueDate);
      if (cmp !== 0) return cmp;
      return b.createdAtMs - a.createdAtMs;
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return b.createdAtMs - a.createdAtMs;
  });

  return copy;
}

export function formatDueDate(dueDate: string): string {
  if (!dueDate) {
    return 'No due date';
  }
  const parts = dueDate.split('-');
  if (parts.length !== 3) {
    return dueDate;
  }
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) {
    return dueDate;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
