// frontend/components/Applications/ApplicationCard.tsx
import Link from 'next/link';
import { Application } from '@/types';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/Common/StatusBadge';

interface ApplicationCardProps {
  application: Application;
  showActions?: boolean;
  onSubmit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function ApplicationCard({
  application,
  showActions = false,
  onSubmit,
  onDelete,
}: ApplicationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{application.description}</p>
          <p className="text-gray-500 text-xs">创建于 {formatDate(application.created_at)}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {application.review_note && (
        <div className="bg-gray-50 p-3 rounded mb-4">
          <p className="text-sm text-gray-700">
            <strong>审核意见：</strong>{application.review_note}
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <Link
          href={`/applications/${application.id}`}
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          查看详情
        </Link>
        
        {showActions && application.status === 'draft' && (
          <>
            {onSubmit && (
              <button
                onClick={() => onSubmit(application.id)}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                提交审核
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(application.id)}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                删除
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}