'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi, connectionApi } from '@/lib/api';
import { Project, ConnectionRequest, ConnectionRequestType, ConnectionRequestStatus } from '@/types';
import { message } from 'antd';
import { FileTextOutlined, BookOutlined, PauseOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, RocketOutlined, ArrowRightOutlined, InboxOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function ReviewPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'team_owner') {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchRequests(selectedProject.id);
    }
  }, [selectedProject]);

  async function fetchProjects() {
    try {
      setLoading(true);
      const res = await projectApi.list({ status: 'online' });
      if (res.data) {
        const data = res.data as any;
        setProjects(data.items as Project[]);
        if (data.items?.length > 0) {
          setSelectedProject(data.items[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests(projectId: number) {
    try {
      const res = await connectionApi.list(projectId);
      if (res.data) {
        const data = res.data as { items?: ConnectionRequest[] };
        setRequests(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch connection requests:', err);
    }
  }

  async function handleAccept(requestId: number) {
    if (!selectedProject) return;
    try {
      await connectionApi.accept(selectedProject.id, requestId);
      fetchRequests(selectedProject.id);
      message.success('已通过对接申请');
    } catch (err) {
      console.error('Failed to accept request:', err);
      message.error('操作失败');
    }
  }

  async function handleReject(requestId: number) {
    if (!selectedProject) return;
    try {
      await connectionApi.reject(selectedProject.id, requestId);
      fetchRequests(selectedProject.id);
      message.success('已拒绝对接申请');
    } catch (err) {
      console.error('Failed to reject request:', err);
      message.error('操作失败');
    }
  }

  const getRequestTypeLabel = (type: ConnectionRequestType) => {
    const labels: Record<ConnectionRequestType, string> = {
      bp_access: '申请查看BP',
      become_mentor: '申请成为项目导师',
      resource_partner: '提供资源合作',
    };
    return labels[type];
  };

  const getRequestTypeIcon = (type: ConnectionRequestType) => {
    switch (type) {
      case 'bp_access':
        return <FileTextOutlined className="text-[#00f0ff]" />;
      case 'become_mentor':
        return <BookOutlined className="text-[#00ff88]" />;
      case 'resource_partner':
        return <PauseOutlined className="text-[#ffb800]" />;
    }
  };

  const getStatusLabel = (status: ConnectionRequestStatus) => {
    const labels: Record<ConnectionRequestStatus, string> = {
      pending: '待处理',
      approved: '已通过',
      rejected: '已拒绝',
      expired: '已过期',
    };
    return labels[status];
  };

  const getStatusIcon = (status: ConnectionRequestStatus) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined className="text-[#ffb800]" />;
      case 'approved':
        return <CheckCircleOutlined className="text-[#00ff88]" />;
      case 'rejected':
        return <CloseCircleOutlined className="text-red-400" />;
      case 'expired':
        return <CloseCircleOutlined className="text-gray-500" />;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (!user || user.role !== 'team_owner') {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">您没有权限访问此页面</p>
          <Link href="/dashboard" className="text-[#00f0ff] hover:underline">返回控制台</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">对接申请审核</h1>
            <p className="text-gray-400 mt-1">管理您项目的对接申请，与投资人、导师和资源方建立联系</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Project List Sidebar */}
          <div className="lg:col-span-1">
            <div className="holo-card p-4">
              <h3 className="font-black tracking-tight text-white mb-4">我的项目</h3>
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center space-x-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                      selectedProject?.id === project.id
                        ? 'bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold'
                        : 'hover:bg-white/[0.03] text-gray-300'
                    }`}
                  >
                    <RocketOutlined className="w-5 h-5" />
                    <span className="truncate">{project.title}</span>
                    {selectedProject?.id === project.id && pendingRequests.length > 0 && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#050510]/30 text-[#050510]">
                        {pendingRequests.length}
                      </span>
                    )}
                    {selectedProject?.id !== project.id && pendingRequests.length > 0 && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                        {pendingRequests.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="lg:col-span-3">
            <div className="holo-card p-6">
              {selectedProject ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black tracking-tight text-white">
                      {selectedProject.title}
                    </h2>
                    <Link
                      href={`/projects/${selectedProject.id}`}
                      className="text-sm text-[#00f0ff] hover:underline flex items-center"
                    >
                      查看项目 <ArrowRightOutlined className="ml-1" />
                    </Link>
                  </div>

                  {pendingRequests.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-300">待处理申请</h3>
                        <span className="text-xs px-3 py-1 bg-red-500/10 text-red-400 rounded-full">
                          {pendingRequests.length} 项待处理
                        </span>
                      </div>
                      <div className="space-y-3">
                        {pendingRequests.map((request) => (
                          <div key={request.id} className="border border-white/[0.06] rounded-xl p-4 hover:border-[#00f0ff]/20 hover:bg-white/[0.02] transition-all duration-300">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-white/[0.03] rounded-full flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                                  {getRequestTypeIcon(request.request_type)}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-white">
                                      {getRequestTypeLabel(request.request_type)}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-[#ffb800]/10 text-[#ffb800] rounded-full">
                                      {getStatusLabel(request.status)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1">
                                    申请人：{request.user?.nickname || request.user?.username || '未知用户'}
                                  </p>
                                  {request.message && (
                                    <p className="text-sm text-gray-300 mt-2 bg-white/[0.02] rounded-xl p-3 border border-white/[0.06]">
                                      {request.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2 flex-shrink-0">
                                <button
                                  onClick={() => handleAccept(request.id)}
                                  className="px-4 py-2 bg-[#00ff88] text-[#050510] font-bold text-sm rounded-xl hover:bg-[#00ff88]/90 shadow-sm hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                                >
                                  <CheckCircleOutlined className="mr-1" />接受
                                </button>
                                <button
                                  onClick={() => handleReject(request.id)}
                                  className="px-4 py-2 bg-white/[0.03] text-gray-300 text-sm rounded-xl hover:bg-white/[0.06] border border-white/[0.06] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                                >
                                  <CloseCircleOutlined className="mr-1" />拒绝
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {processedRequests.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-4">处理历史</h3>
                      <div className="space-y-3">
                        {processedRequests.map((request) => (
                          <div key={request.id} className="border border-white/[0.06] rounded-xl p-4 opacity-75">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-white/[0.03] rounded-full flex items-center justify-center border border-white/[0.06]">
                                  {getRequestTypeIcon(request.request_type)}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-300">
                                    {getRequestTypeLabel(request.request_type)}
                                  </span>
                                  <p className="text-sm text-gray-500">
                                    {request.user?.nickname || request.user?.username || '未知用户'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(request.status)}
                                <span className={`text-sm ${
                                  request.status === 'approved' ? 'text-[#00ff88]' :
                                  request.status === 'rejected' ? 'text-red-400' : 'text-gray-500'
                                }`}>
                                  {getStatusLabel(request.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {requests.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/[0.06]">
                        <InboxOutlined className="text-3xl text-gray-500" />
                      </div>
                      <p className="text-gray-400">暂无对接申请</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/[0.06]">
                    <RocketOutlined className="text-3xl text-gray-500" />
                  </div>
                  <p className="text-gray-400">请从左侧选择一个项目</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
