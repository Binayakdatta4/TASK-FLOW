import { AlertTriangle, Calendar, Check, Flag, Pencil, Trash2 } from 'lucide-react';
import type { TaskItem } from '../types/task';
import { formatDueDate, isTaskOverdue } from '../utils/taskUtils';

interface TaskCardProps {
  task: TaskItem;
  onToggleComplete: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const overdue = isTaskOverdue(task);

  const priorityColorClass =
    task.priority === 'High'
      ? 'text-[#DC2626]'
      : task.priority === 'Medium'
        ? 'text-amber-600'
        : 'text-slate-500';

  return (
    <article
      data-testid={`task-card-${task.id}`}
      className={`bg-white border rounded-xl p-4 sm:p-5 transition-all duration-150 hover:shadow-sm ${
        overdue
          ? 'border-red-300 bg-red-50/20'
          : task.completed
            ? 'border-slate-200/80 bg-slate-50/40'
            : 'border-slate-200'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          aria-label={
            task.completed
              ? `Mark '${task.title}' as pending`
              : `Mark '${task.title}' as completed`
          }
          aria-pressed={task.completed}
          className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 ${
            task.completed
              ? 'bg-[#16A34A] border-[#16A34A] text-white'
              : 'bg-white border-slate-300 text-transparent hover:border-[#4F46E5]'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <h3
              className={`text-base font-semibold leading-snug break-words ${
                task.completed ? 'line-through text-slate-400' : 'text-[#1E293B]'
              }`}
            >
              {task.title}
            </h3>

            {/* CRUD Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit '${task.title}'`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete '${task.title}'`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-1.5 text-sm leading-relaxed break-words ${
                task.completed ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Unboxed Metadata Row (Zero-Pill Discipline) */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
            <span className={`inline-flex items-center gap-1 font-medium ${priorityColorClass}`}>
              <Flag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{task.priority} Priority</span>
            </span>

            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>

            <span
              className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                overdue ? 'text-[#DC2626] font-semibold' : 'text-slate-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{formatDueDate(task.dueDate)}</span>
            </span>

            {overdue && (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#DC2626]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Overdue</span>
                </span>
              </>
            )}

            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>

            <span
              className={`font-medium ${
                task.completed ? 'text-[#16A34A]' : 'text-slate-500'
              }`}
            >
              {task.completed ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
