import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormMessageProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  className?: string;
}

export function FormMessage({ type, message, className }: FormMessageProps) {
  const styles = {
    success: 'bg-success/10 text-success border-success/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={cn('flex items-center gap-2 p-3 rounded-md border text-sm', styles[type], className)}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
