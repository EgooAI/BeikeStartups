'use client';

import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { Project, ProjectStage } from '@/types';
import Link from 'next/link';
import { message } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
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
        const data = res.data;
        if (Array.isArray(data)) {
          setProjects(data);
        } else if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
          setProjects(data.items);
        } else if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
          setProjects(data.content);
        } else {
          setProjects([]);
        }
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
      message.success('已通过上架申请');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
    }
  };

  const handleRejectOnline = async (id: number) => {
    try {
      await projectApi.rejectOnline(id);
      loadProjects();
      message.success('已拒绝上架申请');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
    }
  };

  const handleOffline = async (id: number) => {
    try {
      await projectApi.invalidate(id);
      loadProjects();
      message.success('项目已下架');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<ProjectStage, string> = {
      idea: '创意阶段',
      seed: '种子计划',
      prototype: '原型开发',
      launched: '产品上线',
      revenue: '营收验证',
    };
    return labels[stage as ProjectStage] || stage;
  };

  const getStageColor = (stage: string) => {
    const colors: Record<ProjectStage, string> = {
      idea: 'bg-[#b347ea]/10 text-[#b347ea]',
      seed: 'bg-[#00f0ff]/10 text-[#00f0ff]',
      prototype: 'bg-white/[0.05] text-gray-300',
      launched: 'bg-[#ffb800]/10 text-[#ffb800]',
      revenue: 'bg-[#00ff88]/10 text-[#00ff88]',
    };
    return colors[stage as ProjectStage] || 'bg-white/[0.05] text-gray-400';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此项目吗？此操作不可恢复。')) return;
    try {
      await projectApi.delete(id);
      loadProjects();
      message.success('项目已删除');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除失败';
      message.error(errorMessage);
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
      draft: 'bg-white/[0.05] text-gray-400',
      pending_online: 'bg-[#ffb800]/10 text-[#ffb800]',
      online: 'bg-[#00ff88]/10 text-[#00ff88]',
      rejected_online: 'bg-red-500/10 text-red-400',
      pending_offline: 'bg-orange-500/10 text-orange-400',
      offline: 'bg-white/[0.05] text-gray-400',
      invalid: 'bg-red-500/10 text-red-400/70',
    };
    return colors[status] || 'bg-white/[0.05] text-gray-400';
  };

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-start pt-20 bg-[#050510]">
        <div className="relative flex justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/[0.06] border-t-[#00f0ff] animate-spin" />
          <div className="absolute w-7 h-7 rounded-full border-4 border-white/[0.04] border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
        </div>
      </div>
    );
  }

  const pendingProjects = projects.filter(p => p.status === 'pending_online');

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">项目管理</h1>
        <p className="text-gray-400 mt-1">审核和管理平台上的创业项目，共 {projects.length} 个项目</p>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.05] flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === 'all' ? 'bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold' : 'bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white'
              }`}
          >
            全部 ({projects.length})
          </button>
          <button
            onClick={() => setFilter('pending_online')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === 'pending_online' ? 'bg-[#ffb800] text-[#050510] font-bold' : 'bg-[#ffb800]/10 text-[#ffb800] hover:bg-[#ffb800]/20'
              }`}
          >
            待审核 ({pendingProjects.length})
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === 'online' ? 'bg-[#00ff88] text-[#050510] font-bold' : 'bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20'
              }`}
          >
            已上架
          </button>
          <button
            onClick={() => setFilter('invalid')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === 'invalid' ? 'bg-red-500 text-white font-bold' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}
          >
            已作废
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.03]">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">项目名称</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">所属团队</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">阶段</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">浏览</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">发布时间</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/projects/${project.id}`} className="font-medium text-[#00f0ff] hover:text-[#00c8ff] transition-colors">
                      {project.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{project.team?.name || '未关联'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(project.stage)}`}>
                      {getStageLabel(project.stage)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{project.view_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(project.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="px-3 py-1.5 text-xs bg-white/[0.03] text-gray-400 rounded-xl hover:bg-white/[0.06] hover:text-white transition-all duration-300"
                      >
                        <EyeOutlined className="mr-1" /> 查看
                      </Link>
                      {project.status === 'pending_online' && (
                        <>
                          <button
                            onClick={() => handleApproveOnline(project.id)}
                            className="px-3 py-1.5 text-xs bg-[#00ff88]/10 text-[#00ff88] rounded-xl hover:bg-[#00ff88]/20 transition-all duration-300"
                          >
                            <CheckCircleOutlined className="mr-1" /> 通过
                          </button>
                          <button
                            onClick={() => handleRejectOnline(project.id)}
                            className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300"
                          >
                            <CloseCircleOutlined className="mr-1" /> 拒绝
                          </button>
                        </>
                      )}
                      {project.status === 'online' && (
                        <button
                          onClick={() => handleOffline(project.id)}
                          className="px-3 py-1.5 text-xs bg-orange-500/10 text-orange-400 rounded-xl hover:bg-orange-500/20 transition-all duration-300"
                        >
                          下架
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300"
                      >
                        <DeleteOutlined className="mr-1" /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/[0.03] rounded-2xl mb-3">
                      <ProjectOutlined className="text-3xl text-gray-500" />
                    </div>
                    <p className="text-gray-500">暂无项目</p>
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
