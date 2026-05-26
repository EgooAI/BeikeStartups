// frontend/components/Projects/ProjectList.tsx
'use client';

import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import ProjectCard from './ProjectCard';
import Loading from '@/components/Common/Loading';

interface ProjectListProps {
  search?: string;
}

export default function ProjectList({ search }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, [search]);

  const loadProjects = async () => {
    try {
      const response = await projectApi.list({ search });
      if (response.data) {
        setProjects(response.data as Project[]);
      }
    } catch (err: any) {
      setError(err.message || '加载项目列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="large" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">暂无项目</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}