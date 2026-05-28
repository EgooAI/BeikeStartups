'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectApi, connectionApi } from '@/lib/api';
import { Project, ConnectionRequestType } from '@/types';
import { ArrowLeftOutlined, FileTextOutlined, BookOutlined, InboxOutlined, SendOutlined } from '@ant-design/icons';

export default function ConnectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [requestType, setRequestType] = useState<ConnectionRequestType>('bp_access');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'investor':
          setRequestType('bp_access');
          break;
        case 'mentor':
          setRequestType('become_mentor');
          break;
        case 'partner':
          setRequestType('resource_partner');
          break;
      }
    }
  }, [user]);

  async function fetchProject() {
    try {
      const res = await projectApi.get(Number(params.id));
      if (res.data) {
        setProject(res.data as Project);
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await connectionApi.create(Number(params.id), {
        request_type: requestType,
        message: message || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

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
        return <FileTextOutlined />;
      case 'become_mentor':
        return <BookOutlined />;
      case 'resource_partner':
        return <InboxOutlined />;
    }
  };

  const getRoleBasedOptions = () => {
    if (!user) return [];
    switch (user.role) {
      case 'investor':
        return [{ value: 'bp_access', label: '申请查看BP' }];
      case 'mentor':
        return [{ value: 'become_mentor', label: '申请成为项目导师' }];
      case 'partner':
        return [{ value: 'resource_partner', label: '提供资源合作' }];
      default:
        return [
          { value: 'bp_access', label: '申请查看BP' },
          { value: 'become_mentor', label: '申请成为项目导师' },
          { value: 'resource_partner', label: '提供资源合作' },
        ];
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">请先登录</p>
          <a href="/login" className="text-[#0a2a5c] hover:underline">立即登录</a>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="bg-white rounded-2xl shadow-custom p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SendOutlined className="text-green-600 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-[#0a2a5c] mb-2">申请提交成功</h2>
          <p className="text-gray-500 mb-6">项目团队将在3个工作日内审核您的申请</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              返回项目详情
            </button>
            <button
              onClick={() => router.push('/projects')}
              className="flex-1 px-4 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors"
            >
              浏览更多项目
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleOptions = getRoleBasedOptions();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-[#0a2a5c] transition-colors mb-6"
        >
          <ArrowLeftOutlined className="mr-2" /> 返回项目详情
        </button>

        <div className="bg-white rounded-2xl shadow-custom overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] flex items-center justify-center relative">
            <div className="text-white text-center">
              <div className={`w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3`}>
                {getRequestTypeIcon(requestType)}
              </div>
              <h1 className="text-2xl font-bold">{getRequestTypeLabel(requestType)}</h1>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">对接项目</p>
              <p className="font-semibold text-[#0a2a5c]">{project.title}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {roleOptions.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">对接类型</label>
                  <div className="grid grid-cols-3 gap-3">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRequestType(option.value as ConnectionRequestType)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          requestType === option.value
                            ? 'border-[#0a2a5c] bg-[#0a2a5c]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg mb-1 block">{option.value === 'bp_access' ? '📄' : option.value === 'become_mentor' ? '👨‍🏫' : '📦'}</span>
                        <span className="text-sm font-medium text-gray-700">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">补充说明（选填）</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="请简要说明您的背景、优势或合作意向..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] resize-none"
                />
                <p className="mt-2 text-xs text-gray-400">请简要介绍您的背景和合作意向，帮助项目团队更好地了解您</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '提交申请'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
