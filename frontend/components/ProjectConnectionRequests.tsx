'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { connectionApi, teamApi, projectApi } from '@/lib/api';
import { ConnectionRequest, ConnectionRequestType, ConnectionRequestStatus, Project } from '@/types';
import { FileTextOutlined, BookOutlined, GiftOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface Props {
  projectId: number;
}

export default function ProjectConnectionRequests({ projectId }: Props) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (user?.role === 'team_owner') {
      checkAccessAndFetchRequests();
    }
  }, [user, projectId]);

  async function checkAccessAndFetchRequests() {
    try {
      setLoading(true);
      
      // 获取项目信息
      const projectRes = await projectApi.get(projectId);
      if (!projectRes.data) {
        setHasAccess(false);
        return;
      }
      const projectData = projectRes.data as Project;
      setProject(projectData);
      
      // 获取用户所在团队
      const teamRes = await teamApi.list();
      if (!teamRes.data) {
        setHasAccess(false);
        return;
      }
      
      const teams = (teamRes.data as any).items || [];
      const teamIds = teams.map((t: any) => t.id);
      
      // 验证用户是否是该项目的团队成员
      if (teamIds.includes(projectData.team_id)) {
        setHasAccess(true);
        // 获取对接申请
        const reqRes = await connectionApi.list(projectId);
        if (reqRes.data) {
          const data = reqRes.data as { items?: ConnectionRequest[] };
          setRequests(data.items || []);
        }
      } else {
        setHasAccess(false);
      }
    } catch (err) {
      console.error('Failed to fetch connection requests:', err);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(requestId: number) {
    try {
      await connectionApi.accept(projectId, requestId);
      checkAccessAndFetchRequests();
    } catch (err) {
      console.error('Failed to accept request:', err);
      alert('操作失败');
    }
  }

  async function handleReject(requestId: number) {
    try {
      await connectionApi.reject(projectId, requestId);
      checkAccessAndFetchRequests();
    } catch (err) {
      console.error('Failed to reject request:', err);
      alert('操作失败');
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
        return <GiftOutlined className="text-orange-500" />;
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

  if (user?.role !== 'team_owner') {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[#0a2a5c] mb-4 flex items-center">
        <FileTextOutlined className="mr-2" />对接申请管理
      </h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0a2a5c] border-t-transparent" />
        </div>
      ) : !hasAccess ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <FileTextOutlined className="text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">您没有权限管理此项目的对接申请</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">待处理申请 ({pendingRequests.length})</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getRequestTypeIcon(request.request_type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {getRequestTypeLabel(request.request_type)}
                        </p>
                        <p className="text-sm text-gray-500">
                          申请人：{request.user?.nickname || request.user?.username || '未知用户'}
                          {request.message && (
                            <span className="ml-2">- {request.message}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center"
                      >
                        <CheckCircleOutlined className="mr-1" />接受
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                      >
                        <CloseCircleOutlined className="mr-1" />拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {processedRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">历史记录 ({processedRequests.length})</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {processedRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getRequestTypeIcon(request.request_type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {getRequestTypeLabel(request.request_type)}
                        </p>
                        <p className="text-sm text-gray-500">
                          申请人：{request.user?.nickname || request.user?.username || '未知用户'} · {getStatusLabel(request.status)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500">
                      {getStatusIcon(request.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requests.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <FileTextOutlined className="text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500">暂无对接申请</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
