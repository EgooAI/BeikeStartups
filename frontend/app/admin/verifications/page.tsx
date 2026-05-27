'use client';

import { useEffect, useState } from 'react';
import { applicationApi, roleApi } from '@/lib/api';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

interface RoleRequest {
  id: number;
  requested_role: string;
  organization?: string;
  expertise?: string;
  investment_focus?: string;
  service_area?: string;
  application_note?: string;
  role_status: string;
  user_id: number;
  user?: any;
  created_at: string;
  review_note?: string;
}

export default function AdminVerificationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'roles'>('applications');
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [appRes, roleRes] = await Promise.allSettled([
        applicationApi.list(),
        roleApi.listRequests(),
      ]);

      if (appRes.status === 'fulfilled' && appRes.value.data) {
        const data = appRes.value.data as any;
        setApplications(Array.isArray(data) ? data : data.items || []);
      }
      if (roleRes.status === 'fulfilled' && roleRes.value.data) {
        const data = roleRes.value.data as any;
        setRoleRequests(Array.isArray(data) ? data : data.items || []);
      }
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleApproveApp = async (id: number) => {
    const note = reviewNotes[id] || '审核通过，欢迎加入创业团队！';
    try {
      await applicationApi.approve(id, note);
      loadData();
      setReviewNotes(prev => ({ ...prev, [id]: '' }));
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleRejectApp = async (id: number) => {
    const note = reviewNotes[id] || '';
    if (!note) { alert('请输入拒绝理由'); return; }
    try {
      await applicationApi.reject(id, note);
      loadData();
      setReviewNotes(prev => ({ ...prev, [id]: '' }));
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleApproveRole = async (id: number) => {
    try {
      await roleApi.approve(id);
      loadData();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleRejectRole = async (id: number) => {
    try {
      await roleApi.reject(id);
      loadData();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      investor: '投资人',
      mentor: '导师',
      partner: '资源方',
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'pending');
  const pendingRoles = roleRequests.filter(r => r.role_status === 'pending');

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2a5c]">身份审核</h1>
        <p className="text-gray-500 mt-1">审核创业团队认证申请和投资人/导师/资源方身份认证。</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'applications'
              ? 'bg-white text-[#0a2a5c] shadow-sm'
              : 'text-gray-500 hover:text-[#0a2a5c]'
          }`}
        >
          创业团队认证
          {pendingApps.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">{pendingApps.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'roles'
              ? 'bg-white text-[#0a2a5c] shadow-sm'
              : 'text-gray-500 hover:text-[#0a2a5c]'
          }`}
        >
          身份认证申请
          {pendingRoles.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">{pendingRoles.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-custom border border-gray-100 p-12 text-center text-gray-400">
              <FileTextOutlined className="text-5xl mb-3 block" />
              <p>暂无创业认证申请</p>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-custom border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                      app.status === 'approved' ? 'bg-green-500' :
                      app.status === 'rejected' ? 'bg-red-500' :
                      app.status === 'pending' ? 'bg-amber-500' : 'bg-gray-400'
                    }`}>
                      {app.status === 'approved' ? <CheckCircleOutlined /> :
                       app.status === 'rejected' ? <CloseCircleOutlined /> :
                       app.status === 'pending' ? <ClockCircleOutlined /> : <FileTextOutlined />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0a2a5c] text-lg">{app.title}</h3>
                      <p className="text-sm text-gray-400">申请时间: {formatDate(app.created_at)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.description}</p>
                  {app.business_plan && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">商业计划：</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.business_plan}</p>
                    </div>
                  )}
                </div>

                {app.review_note && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600"><strong>审核意见：</strong>{app.review_note}</p>
                  </div>
                )}

                {app.status === 'pending' && (
                  <div className="border-t border-gray-100 pt-4">
                    <textarea
                      placeholder="输入审核意见..."
                      value={reviewNotes[app.id] || ''}
                      onChange={(e) => setReviewNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] mb-3"
                      rows={2}
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproveApp(app.id)}
                        className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        <CheckCircleOutlined className="mr-1" /> 通过
                      </button>
                      <button
                        onClick={() => handleRejectApp(app.id)}
                        className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        <CloseCircleOutlined className="mr-1" /> 拒绝
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          {roleRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-custom border border-gray-100 p-12 text-center text-gray-400">
              <SafetyOutlined className="text-5xl mb-3 block" />
              <p>暂无身份认证申请</p>
            </div>
          ) : (
            roleRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow-custom border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                      req.role_status === 'approved' ? 'bg-green-500' :
                      req.role_status === 'rejected' ? 'bg-red-500' :
                      'bg-amber-500'
                    }`}>
                      {req.role_status === 'approved' ? <CheckCircleOutlined /> :
                       req.role_status === 'rejected' ? <CloseCircleOutlined /> :
                       <ClockCircleOutlined />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0a2a5c] text-lg">
                        申请成为{getRoleLabel(req.requested_role)}
                      </h3>
                      {req.user && (
                        <p className="text-sm text-gray-400">
                          申请人: {req.user.nickname || req.user.username} ({req.user.email})
                        </p>
                      )}
                      <p className="text-xs text-gray-400">申请时间: {formatDate(req.created_at)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.role_status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    req.role_status === 'approved' ? 'bg-green-50 text-green-600' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {req.role_status === 'pending' ? '待审核' : req.role_status === 'approved' ? '已通过' : '已拒绝'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {req.organization && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">所属机构</p>
                      <p className="text-sm text-gray-700">{req.organization}</p>
                    </div>
                  )}
                  {req.expertise && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">专业领域</p>
                      <p className="text-sm text-gray-700">{req.expertise}</p>
                    </div>
                  )}
                  {req.investment_focus && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">投资方向</p>
                      <p className="text-sm text-gray-700">{req.investment_focus}</p>
                    </div>
                  )}
                  {req.service_area && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">服务领域</p>
                      <p className="text-sm text-gray-700">{req.service_area}</p>
                    </div>
                  )}
                  {req.application_note && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">申请说明</p>
                      <p className="text-sm text-gray-700">{req.application_note}</p>
                    </div>
                  )}
                </div>

                {req.role_status === 'pending' && (
                  <div className="flex space-x-3 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => handleApproveRole(req.id)}
                      className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      <CheckCircleOutlined className="mr-1" /> 通过认证
                    </button>
                    <button
                      onClick={() => handleRejectRole(req.id)}
                      className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      <CloseCircleOutlined className="mr-1" /> 拒绝
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}