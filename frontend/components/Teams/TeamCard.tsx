// frontend/components/Teams/TeamCard.tsx
import Link from 'next/link';
import { Team } from '@/types';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/Common/StatusBadge';

interface TeamCardProps {
  team: Team;
  showActions?: boolean;
  onDelete?: (id: number) => void;
}

export default function TeamCard({ team, showActions = false, onDelete }: TeamCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{team.description}</p>
          {team.owner && (
            <p className="text-gray-500 text-xs">创始人：{team.owner.nickname || team.owner.username}</p>
          )}
        </div>
        <StatusBadge status={team.status} size="sm" />
      </div>

      <div className="flex space-x-3">
        <Link
          href={`/teams/${team.id}`}
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          查看详情
        </Link>
        
        {showActions && onDelete && (
          <button
            onClick={() => onDelete(team.id)}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}