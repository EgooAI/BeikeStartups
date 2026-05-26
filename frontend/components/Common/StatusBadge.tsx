// frontend/components/Common/StatusBadge.tsx
import { getStatusColor, getStatusText } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`rounded-full font-medium ${getStatusColor(status)} ${sizeClasses[size]}`}>
      {getStatusText(status)}
    </span>
  );
}