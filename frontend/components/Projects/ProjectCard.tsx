// frontend/components/Projects/ProjectCard.tsx
import Link from 'next/link';
import { Project, ProjectStage } from '@/types';
import { truncateText } from '@/lib/utils';
import StatusBadge from '@/components/Common/StatusBadge';

const STAGE_LABELS: Record<ProjectStage, string> = {
  idea: '创意阶段',
  seed: '种子计划',
  prototype: '原型开发',
  launched: '产品上线',
  revenue: '营收验证',
};

const STAGE_COLORS: Record<ProjectStage, string> = {
  idea: 'bg-purple-100 text-purple-700',
  seed: 'bg-blue-100 text-blue-700',
  prototype: 'bg-[#0a2a5c]/10 text-[#0a2a5c]',
  launched: 'bg-amber-100 text-amber-700',
  revenue: 'bg-green-100 text-green-700',
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {project.cover_image && (
        <img src={project.cover_image} alt={project.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
          <StatusBadge status={project.status} size="sm" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[project.stage] || 'bg-gray-100 text-gray-600'}`}>
            {STAGE_LABELS[project.stage] || '未知阶段'}
          </span>
          {project.team && (
            <span className="text-gray-400 text-xs">| {project.team.name}</span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          {truncateText(project.description, 100)}
        </p>

        <p className="text-gray-500 text-xs mb-4">浏览量：{project.view_count}</p>

        <Link
          href={`/projects/${project.id}`}
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          查看详情 →
        </Link>
      </div>
    </div>
  );
}