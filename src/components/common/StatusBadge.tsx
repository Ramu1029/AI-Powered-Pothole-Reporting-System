import { cn } from '@/lib/utils';
import { ReportStatus, Severity } from '@/types';

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-info/10 text-info',
  },
  verified: {
    label: 'Verified',
    className: 'bg-accent/10 text-accent',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-warning/10 text-warning',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-success/10 text-success',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig: Record<Severity, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-muted text-muted-foreground',
  },
  medium: {
    label: 'Medium',
    className: 'bg-warning/10 text-warning',
  },
  high: {
    label: 'High',
    className: 'bg-destructive/15 text-destructive',
  },
  critical: {
    label: 'Critical',
    className: 'bg-destructive/20 text-destructive font-semibold',
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
