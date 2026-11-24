import { AlertCircle, CheckCircle2, Clock, Layers } from 'lucide-react';
import type { TaskStatsSummary } from '../utils/taskUtils';

interface TaskStatsProps {
  stats: TaskStatsSummary;
}

export function TaskStats({ stats }: TaskStatsProps) {
  const cards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: Layers,
      accentClass: 'text-[#4F46E5] bg-indigo-50',
      valueClass: 'text-[#1E293B]',
    },
    {
      label: 'Completed Tasks',
      value: stats.completed,
      icon: CheckCircle2,
      accentClass: 'text-[#16A34A] bg-green-50',
      valueClass: 'text-[#16A34A]',
    },
    {
      label: 'Pending Tasks',
      value: stats.pending,
      icon: Clock,
      accentClass: 'text-[#6366F1] bg-indigo-50',
      valueClass: 'text-[#1E293B]',
    },
    {
      label: 'Overdue Tasks',
      value: stats.overdue,
      icon: AlertCircle,
      accentClass: stats.overdue > 0 ? 'text-[#DC2626] bg-red-50' : 'text-slate-500 bg-slate-100',
      valueClass: stats.overdue > 0 ? 'text-[#DC2626]' : 'text-[#1E293B]',
    },
  ];

  return (
    <section aria-label="Task statistics" className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 flex items-center justify-between gap-2 sm:gap-3"
          >
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 whitespace-nowrap">{card.label}</p>
              <p
                data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`mt-1 sm:mt-1.5 text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight ${card.valueClass}`}
              >
                {card.value}
              </p>
            </div>
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${card.accentClass}`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
