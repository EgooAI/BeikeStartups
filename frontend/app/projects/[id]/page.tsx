// frontend/app/projects/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const projectId = parseInt(params.id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadProject();
    }
  }, [user, authLoading]);

  const loadProject = async () => {
    try {
      const response = await projectApi.get(projectId);
      if (response.data) {
        setProject(response.data as Project);
      }
    } catch (err: any) {
      setError(err.message || '加载项目详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOnline = async () => {
    try {
      await projectApi.requestOnline(projectId);
      loadProject();
    } catch (err: any) {
      alert(err.message || '申请上架失败');
    }
  };

  const handleApproveOnline = async () => {
    try {
      await projectApi.approveOnline(projectId);
      loadProject();
    } catch (err: any) {
      alert(err.message || '审批失败');
    }
  };

  const handleRejectOnline = async () => {
    try {
      await projectApi.rejectOnline(projectId);
      loadProject();
    } catch (err: any) {
      alert(err.message || '拒绝失败');
    }
  };

  const handleRequestOffline = async () => {
    try {
      await projectApi.requestOffline(projectId);
      loadProject();
    } catch (err: any) {
      alert(err.message || '申请下架失败');
    }
  };

  const handleInvalidate = async () => {
    if (!confirm('确定要作废这个项目吗？')) return;
    
    try {
      await projectApi.invalidate(projectId);
      loadProject();
    } catch (err: any) {
      alert(err.message || '作废失败');
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个项目吗？')) return;
    
    try {
      await projectApi.delete(projectId);
      router.push('/projects');
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">项目不存在</p>
      </div>
    );
  }

  const isOwner = project.team?.owner_id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canManage = isOwner || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-700 mb-4"
          >
            ← 返回列表
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {project.cover_image && (
            <img src={project.cover_image} alt={project.title} className="w-full h-64 object-cover" />
          )}
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                <p className="text-gray-500 text-sm">
                  创建于 {formatDate(project.created_at)} · 浏览量 {project.view_count}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>

            {project.team && (
              <div className="mb-6">
                <p className="text-gray-600">
                  <strong>团队：</strong>{project.team.name}
                </p>
              </div>
            )}

            {project.tags && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {project.tags.split(',').map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">项目描述</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>

              {project.content && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">详细内容</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.content}</p>
                </div>
              )}
            </div>

            {canManage && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">管理操作</h3>
                <div className="flex flex-wrap gap-4">
                  {project.status === 'draft' && isOwner && (
                    <button
                      onClick={handleRequestOnline}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      申请上架
                    </button>
                  )}

                  {project.status === 'online' && isOwner && (
                    <button
                      onClick={handleRequestOffline}
                      className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      申请下架
                    </button>
                  )}

                  {isAdmin && project.status === 'pending_online' && (
                    <>
                      <button
                        onClick={handleApproveOnline}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        批准上架
                      </button>
                      <button
                        onClick={handleRejectOnline}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        拒绝上架
                      </button>
                    </>
                  )}

                  {canManage && (
                    <button
                      onClick={handleInvalidate}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      作废项目
                    </button>
                  )}

                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      删除项目
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}