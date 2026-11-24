import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { TaskInput, TaskItem, TaskPriority } from '../types/task';
import { TASK_CONSTRAINTS, validateTaskInput, type TaskValidationErrors } from '../utils/taskUtils';

interface TaskFormProps {
  isOpen: boolean;
  editingTask: TaskItem | null;
  defaultPriority: TaskPriority;
  isSubmitting: boolean;
  onSave: (input: TaskInput) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({
  isOpen,
  editingTask,
  defaultPriority,
  isSubmitting,
  onSave,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(defaultPriority);
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<TaskValidationErrors>({});

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate);
    } else {
      setTitle('');
      setDescription('');
      setPriority(defaultPriority);
      setDueDate('');
    }
    setErrors({});

    const timer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 10);
    return () => window.clearTimeout(timer);
  }, [isOpen, editingTask, defaultPriority]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateTaskInput({
      title,
      description,
      priority,
      dueDate,
    });

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSave(result.sanitized);
  };

  const isEditing = Boolean(editingTask);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="task-modal-title" className="text-lg font-semibold text-[#1E293B]">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close task modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {/* Task Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-title-input" className="text-sm font-medium text-[#1E293B]">
                Task Title <span className="text-[#DC2626]">*</span>
              </label>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {title.trim().length}/{TASK_CONSTRAINTS.TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              ref={titleInputRef}
              id="task-title-input"
              type="text"
              value={title}
              maxLength={TASK_CONSTRAINTS.TITLE_MAX_LENGTH}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g., Complete DBMS assignment"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
              className={`w-full h-10 px-3.5 text-sm text-[#1E293B] placeholder:text-slate-400 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.title
                  ? 'border-[#DC2626] focus:ring-red-500/20 focus:border-[#DC2626]'
                  : 'border-slate-200 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]'
              }`}
            />
            {errors.title && (
              <p id="task-title-error" role="alert" className="mt-1.5 text-xs font-medium text-[#DC2626]">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-desc-input" className="text-sm font-medium text-[#1E293B]">
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {description.length}/{TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="task-desc-input"
              rows={3}
              value={description}
              maxLength={TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Add notes, links, or deliverables..."
              className="w-full px-3.5 py-2.5 text-sm text-[#1E293B] placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-colors resize-none"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.description}</p>
            )}
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority-select" className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-10 px-3 text-sm font-medium text-[#1E293B] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-colors"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="task-due-input" className="text-sm font-medium text-[#1E293B]">
                  Due Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-xs font-medium text-[#4F46E5] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                id="task-due-input"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
                }}
                className="w-full h-10 px-3 text-sm font-mono tabular-nums text-[#1E293B] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-colors"
              />
              {errors.dueDate && (
                <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
