// frontend/components/Projects/ProjectCard.tsx
import Link from 'next/link';
import { Project } from '@/types';
import { truncateText } from '@/lib/utils';
import StatusBadge from '@/components/Common/StatusBadge';

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
        
        <p className="text-gray-600 text-sm mb-4">
          {truncateText(project.description, 100)}
        </p>

        {project.team && (
          <p className="text-gray-500 text-xs mb-2">团队：{project.team.name}</p>
        )}

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