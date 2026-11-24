import { ArrowUpDown, ChevronDown, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import type { TaskFilter, TaskSort } from '../types/task';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  sortBy: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  completedCount: number;
  onClearCompleted: () => void;
  onAddNewTask: () => void;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  completedCount,
  onClearCompleted,
  onAddNewTask,
}: SearchBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0">
        <Search
          className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title..."
          aria-label="Search tasks by title"
          className="w-full h-10 pl-9 pr-9 text-sm text-[#1E293B] placeholder:text-slate-400 bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search query"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Filter, Sort, Clear Completed, Add Button */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 shrink-0">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5">
          {/* Filter Dropdown */}
          <div className="relative flex items-center">
            <Filter
              className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
              aria-hidden="true"
            />
            <select
              aria-label="Filter tasks"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as TaskFilter)}
              className="w-full h-10 pl-9 pr-8 text-sm font-medium text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-colors appearance-none"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <ChevronDown
              className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown
              className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
              aria-hidden="true"
            />
            <select
              aria-label="Sort tasks"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as TaskSort)}
              className="w-full h-10 pl-9 pr-8 text-sm font-medium text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-colors appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="dueDate">Due Date</option>
            </select>
            <ChevronDown
              className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Clear Completed Action */}
          {completedCount > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="flex-1 sm:flex-initial h-10 inline-flex items-center justify-center gap-1.5 px-3.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-red-50 hover:text-[#DC2626] hover:border-red-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Clear Completed</span>
            </button>
          )}

          {/* Primary Add New Task CTA */}
          <button
            type="button"
            onClick={onAddNewTask}
            className="flex-1 sm:flex-initial h-10 inline-flex items-center justify-center gap-2 px-4 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add New Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
