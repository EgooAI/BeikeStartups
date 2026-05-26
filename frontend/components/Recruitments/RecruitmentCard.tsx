// frontend/components/Recruitments/RecruitmentCard.tsx
import Link from 'next/link';
import { Recruitment } from '@/types';
import { formatDate, truncateText } from '@/lib/utils';
import StatusBadge from '@/components/Common/StatusBadge';

interface RecruitmentCardProps {
  recruitment: Recruitment;
}

export default function RecruitmentCard({ recruitment }: RecruitmentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{recruitment.title}</h3>
          <p className="text-indigo-600 font-medium mb-2">{recruitment.position}</p>
          {recruitment.salary && (
            <p className="text-green-600 text-sm mb-2">{recruitment.salary}</p>
          )}
        </div>
        <StatusBadge status={recruitment.status} size="sm" />
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        {truncateText(recruitment.description, 100)}
      </p>

      {recruitment.team && (
        <p className="text-gray-500 text-xs mb-2">团队：{recruitment.team.name}</p>
      )}

      {recruitment.deadline && (
        <p className="text-gray-500 text-xs mb-4">
          截止日期：{formatDate(recruitment.deadline)}
        </p>
      )}

      <Link
        href={`/recruitments/${recruitment.id}`}
        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
      >
        查看详情 →
      </Link>
    </div>
  );
}