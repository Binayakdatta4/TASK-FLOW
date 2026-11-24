import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTaskStats,
  filterTasks,
  formatDueDate,
  isTaskOverdue,
  sortTasks,
  TASK_CONSTRAINTS,
  validateTaskInput,
} from './taskUtils';
import type { TaskItem } from '../types/task';

const sampleTasks: TaskItem[] = [
  {
    id: '1',
    title: 'Complete Assignment',
    description: 'Finish DBMS assignment',
    priority: 'High',
    dueDate: '2026-11-25',
    completed: false,
    userId: 'user-1',
    createdAtMs: 1000,
    updatedAtMs: 1000,
  },
  {
    id: '2',
    title: 'Submit Expense Report',
    description: 'Q4 receipts',
    priority: 'Medium',
    dueDate: '2026-11-20',
    completed: false,
    userId: 'user-1',
    createdAtMs: 2000,
    updatedAtMs: 2000,
  },
  {
    id: '3',
    title: 'Update Dependencies',
    description: '',
    priority: 'Low',
    dueDate: '2026-11-18',
    completed: true,
    userId: 'user-1',
    createdAtMs: 3000,
    updatedAtMs: 3500,
  },
  {
    id: '4',
    title: 'Draft Architecture Doc',
    description: 'Outline Firestore rules',
    priority: 'High',
    dueDate: '',
    completed: false,
    userId: 'user-1',
    createdAtMs: 4000,
    updatedAtMs: 4000,
  },
];

test('validateTaskInput rejects empty title and oversized fields', () => {
  const emptyRes = validateTaskInput({
    title: '   ',
    description: 'desc',
    priority: 'Medium',
    dueDate: '2026-11-25',
  });
  assert.equal(emptyRes.valid, false);
  assert.equal(emptyRes.errors.title, 'Task title is required.');

  const longTitle = 'a'.repeat(TASK_CONSTRAINTS.TITLE_MAX_LENGTH + 1);
  const longRes = validateTaskInput({
    title: longTitle,
    description: '',
    priority: 'High',
    dueDate: '',
  });
  assert.equal(longRes.valid, false);
  assert.ok(longRes.errors.title);

  const badDate = validateTaskInput({
    title: 'Valid Task',
    description: '',
    priority: 'Low',
    dueDate: '25-11-2026',
  });
  assert.equal(badDate.valid, false);
  assert.ok(badDate.errors.dueDate);
});

test('validateTaskInput sanitizes valid inputs', () => {
  const res = validateTaskInput({
    title: '  Review PR  ',
    description: '  Check security rules  ',
    priority: 'High',
    dueDate: '2026-11-25',
  });
  assert.equal(res.valid, true);
  assert.deepEqual(res.sanitized, {
    title: 'Review PR',
    description: 'Check security rules',
    priority: 'High',
    dueDate: '2026-11-25',
  });
});

test('isTaskOverdue detects past due pending tasks only', () => {
  const today = '2026-11-23';
  assert.equal(isTaskOverdue(sampleTasks[0], today), false); // 2026-11-25
  assert.equal(isTaskOverdue(sampleTasks[1], today), true); // 2026-11-20 pending
  assert.equal(isTaskOverdue(sampleTasks[2], today), false); // 2026-11-18 completed
  assert.equal(isTaskOverdue(sampleTasks[3], today), false); // no dueDate
});

test('computeTaskStats counts total, completed, pending, and overdue accurately', () => {
  const stats = computeTaskStats(sampleTasks, '2026-11-23');
  assert.deepEqual(stats, {
    total: 4,
    completed: 1,
    pending: 3,
    overdue: 1,
  });
});

test('filterTasks supports search by title and all filter modes', () => {
  assert.equal(filterTasks(sampleTasks, 'assignment', 'all').length, 1);
  assert.equal(filterTasks(sampleTasks, '', 'pending').length, 3);
  assert.equal(filterTasks(sampleTasks, '', 'completed').length, 1);
  assert.equal(filterTasks(sampleTasks, '', 'High').length, 2);
  assert.equal(filterTasks(sampleTasks, '', 'Medium').length, 1);
  assert.equal(filterTasks(sampleTasks, '', 'Low').length, 1);
});

test('sortTasks orders by newest, oldest, and dueDate', () => {
  const newest = sortTasks(sampleTasks, 'newest').map((t) => t.id);
  assert.deepEqual(newest, ['4', '3', '2', '1']);

  const oldest = sortTasks(sampleTasks, 'oldest').map((t) => t.id);
  assert.deepEqual(oldest, ['1', '2', '3', '4']);

  const byDue = sortTasks(sampleTasks, 'dueDate').map((t) => t.id);
  assert.deepEqual(byDue, ['3', '2', '1', '4']);
});

test('formatDueDate formats ISO dates and handles empty values', () => {
  assert.equal(formatDueDate(''), 'No due date');
  assert.equal(formatDueDate('2026-11-25'), 'Nov 25, 2026');
});
