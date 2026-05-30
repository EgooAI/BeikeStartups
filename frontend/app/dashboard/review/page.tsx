'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi, connectionApi } from '@/lib/api';
import { Project, ConnectionRequest, ConnectionRequestType, ConnectionRequestStatus } from '@/types';
import { message } from 'antd';
import { FileTextOutlined, BookOutlined, PauseOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, RocketOutlined, ArrowRightOutlined } from '@ant-design/icons';
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
        return <FileTextOutlined className="text-blue-500" />;
      case 'become_mentor':
        return <BookOutlined className="text-green-500" />;
      case 'resource_partner':
        return <PauseOutlined className="text-orange-500" />;
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
        return <ClockCircleOutlined className="text-yellow-500" />;
      case 'approved':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'rejected':
        return <CloseCircleOutlined className="text-red-500" />;
      case 'expired':
        return <CloseCircleOutlined className="text-gray-400" />;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (!user || user.role !== 'team_owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">您没有权限访问此页面</p>
          <Link href="/dashboard" className="text-[#0a2a5c] hover:underline">返回控制台</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0a2a5c]">对接申请审核</h1>
            <p className="text-gray-500 mt-1">管理您项目的对接申请，与投资人、导师和资源方建立联系</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Project List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-custom p-4">
              <h3 className="font-semibold text-gray-700 mb-4">我的项目</h3>
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      selectedProject?.id === project.id
                        ? 'bg-[#0a2a5c] text-white'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <RocketOutlined className="w-5 h-5" />
                    <span className="truncate">{project.title}</span>
                    {pendingRequests.length > 0 && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        selectedProject?.id === project.id ? 'bg-white/20' : 'bg-red-100 text-red-600'
                      }`}>
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
            <div className="bg-white rounded-xl shadow-custom p-6">
              {selectedProject ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-[#0a2a5c]">
                      {selectedProject.title}
                    </h2>
                    <Link
                      href={`/projects/${selectedProject.id}`}
                      className="text-sm text-[#0a2a5c] hover:underline flex items-center"
                    >
                      查看项目 <ArrowRightOutlined className="ml-1" />
                    </Link>
                  </div>

                  {pendingRequests.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-700">待处理申请</h3>
                        <span className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full">
                          {pendingRequests.length} 项待处理
                        </span>
                      </div>
                      <div className="space-y-3">
                        {pendingRequests.map((request) => (
                          <div key={request.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  {getRequestTypeIcon(request.request_type)}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-800">
                                      {getRequestTypeLabel(request.request_type)}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                                      {getStatusLabel(request.status)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    申请人：{request.user?.nickname || request.user?.username || '未知用户'}
                                  </p>
                                  {request.message && (
                                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">
                                      {request.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2 flex-shrink-0">
                                <button
                                  onClick={() => handleAccept(request.id)}
                                  className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center"
                                >
                                  <CheckCircleOutlined className="mr-1" />接受
                                </button>
                                <button
                                  onClick={() => handleReject(request.id)}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center"
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
                      <h3 className="text-sm font-medium text-gray-700 mb-4">处理历史</h3>
                      <div className="space-y-3">
                        {processedRequests.map((request) => (
                          <div key={request.id} className="border border-gray-100 rounded-xl p-4 opacity-75">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  {getRequestTypeIcon(request.request_type)}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
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
                                  request.status === 'approved' ? 'text-green-600' :
                                  request.status === 'rejected' ? 'text-red-600' : 'text-gray-400'
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
                      <FileTextOutlined className="text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500">暂无对接申请</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <RocketOutlined className="text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500">请从左侧选择一个项目</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
