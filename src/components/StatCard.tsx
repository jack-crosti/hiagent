import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'group rounded-2xl border-0 border-b-2 border-white/20 bg-card p-6 shadow-card transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-elevated hover:-translate-y-3',
      'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-primary/8 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
      'relative overflow-hidden h-full',
      className
    )}>
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-heading text-2xl md:text-3xl font-bold text-card-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn(
              'text-xs font-medium',
              trend.positive ? 'text-success' : 'text-destructive'
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-[1.15] group-hover:shadow-md group-hover:bg-primary/15">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
