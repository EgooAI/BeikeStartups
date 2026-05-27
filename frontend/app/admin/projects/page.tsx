'use client';

import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  ProjectOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await projectApi.list();
      if (res.data) {
        const data = res.data as any;
        setProjects(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleApproveOnline = async (id: number) => {
    try {
      await projectApi.approveOnline(id);
      loadProjects();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleRejectOnline = async (id: number) => {
    try {
      await projectApi.rejectOnline(id);
      loadProjects();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleOffline = async (id: number) => {
    try {
      await projectApi.invalidate(id);
      loadProjects();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '草稿',
      pending_online: '待上架',
      online: '已上架',
      rejected_online: '上架被拒',
      pending_offline: '待下架',
      offline: '已下架',
      rejected_offline: '下架被拒',
      invalid: '已作废',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-500',
      pending_online: 'bg-amber-50 text-amber-600',
      online: 'bg-green-50 text-green-600',
      rejected_online: 'bg-red-50 text-red-500',
      pending_offline: 'bg-orange-50 text-orange-600',
      offline: 'bg-gray-100 text-gray-500',
      invalid: 'bg-red-50 text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  const pendingProjects = projects.filter(p => p.status === 'pending_online');

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2a5c]">项目管理</h1>
        <p className="text-gray-500 mt-1">审核和管理平台上的创业项目，共 {projects.length} 个项目</p>
      </div>

      <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-[#0a2a5c] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部 ({projects.length})
          </button>
          <button
            onClick={() => setFilter('pending_online')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending_online' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            待审核 ({pendingProjects.length})
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'online' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            已上架
          </button>
          <button
            onClick={() => setFilter('invalid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'invalid' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            已作废
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">项目名称</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">所属团队</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">浏览</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">发布时间</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/projects/${project.id}`} className="font-medium text-[#0a2a5c] hover:text-[#f59e0b] transition-colors">
                      {project.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{project.team?.name || '未关联'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{project.view_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(project.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <EyeOutlined className="mr-1" /> 查看
                      </Link>
                      {project.status === 'pending_online' && (
                        <>
                          <button
                            onClick={() => handleApproveOnline(project.id)}
                            className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <CheckCircleOutlined className="mr-1" /> 通过
                          </button>
                          <button
                            onClick={() => handleRejectOnline(project.id)}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <CloseCircleOutlined className="mr-1" /> 拒绝
                          </button>
                        </>
                      )}
                      {project.status === 'online' && (
                        <button
                          onClick={() => handleOffline(project.id)}
                          className="px-3 py-1.5 text-xs bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          下架
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <ProjectOutlined className="text-4xl mb-2 block" />
                    暂无项目
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}