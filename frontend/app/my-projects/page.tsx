'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SendOutlined,
  EyeOutlined,
} from '@ant-design/icons';

export default function TeamProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadProjects();
    }
  }, [user, authLoading]);

  const loadProjects = async () => {
    try {
      const res = await projectApi.list({ status: '' });
      if (res.data) {
        const data = res.data as any;
        setProjects(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOnline = async (projectId: number) => {
    try {
      await projectApi.requestOnline(projectId);
      alert('已提交上架申请，请等待管理员审核');
      loadProjects();
    } catch (err: any) {
      alert(err.message || '申请上架失败');
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm('确定要删除这个项目吗？')) return;
    
    try {
      await projectApi.delete(projectId);
      loadProjects();
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      pending_online: '待上架',
      online: '已上架',
      rejected_online: '上架被拒',
      pending_offline: '待下架',
      offline: '已下架',
      rejected_offline: '下架被拒',
      invalid: '已作废',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600',
      pending_online: 'bg-yellow-100 text-yellow-600',
      online: 'bg-green-100 text-green-600',
      rejected_online: 'bg-red-100 text-red-600',
      pending_offline: 'bg-yellow-100 text-yellow-600',
      offline: 'bg-gray-100 text-gray-600',
      rejected_offline: 'bg-red-100 text-red-600',
      invalid: 'bg-red-100 text-red-600',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-600';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0a2a5c]">我的项目</h1>
            <p className="text-gray-500 mt-1">管理您团队的所有项目</p>
          </div>
          {user?.role !== 'student' && (
            <button
              onClick={() => router.push('/projects/create')}
              className="px-6 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium flex items-center"
            >
              <PlusOutlined className="mr-2" />创建项目
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-custom p-12 text-center">
            <p className="text-gray-600 mb-4">暂无项目</p>
            {user?.role !== 'student' && (
              <button
                onClick={() => router.push('/projects/create')}
                className="text-[#0a2a5c] hover:text-[#0a2a5c]/80 font-medium"
              >
                创建第一个项目 →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-custom p-6 hover:shadow-custom-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-[#0a2a5c]">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center">
                        <EyeOutlined className="mr-1" />
                        {project.view_count} 次浏览
                      </span>
                      <span>创建于 {formatDate(project.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {project.status === 'draft' && (
                      <button
                        onClick={() => handleRequestOnline(project.id)}
                        className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#f59e0b]/90 transition-colors text-sm flex items-center"
                      >
                        <SendOutlined className="mr-1" />申请上架
                      </button>
                    )}
                    {project.status === 'pending_online' && (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg text-sm">
                        等待审核
                      </span>
                    )}
                    <button
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#0a2a5c]/20 transition-colors text-sm"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => router.push(`/projects/${project.id}/edit`)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#0a2a5c]/20 transition-colors text-sm"
                    >
                      <EditOutlined />
                    </button>
                    {(project.status === 'draft' || project.status === 'rejected_online') && (
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:border-red-200 hover:text-red-500 transition-colors text-sm"
                      >
                        <DeleteOutlined />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}