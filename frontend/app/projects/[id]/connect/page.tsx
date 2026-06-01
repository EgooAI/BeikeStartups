'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectApi, connectionApi } from '@/lib/api';
import { Project, ConnectionRequestType } from '@/types';
import { message as antdMessage } from 'antd';
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
      antdMessage.success('对接申请已提交');
    } catch (err: any) {
      antdMessage.error(err.message || '提交失败');
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
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">请先登录</p>
          <a href="/login" className="text-[#00f0ff] hover:underline">立即登录</a>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="holo-card p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00ff88]/20">
            <SendOutlined className="text-[#00ff88] text-2xl" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mb-2">申请提交成功</h2>
          <p className="text-gray-400 mb-6">项目团队将在3个工作日内审核您的申请</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 border border-white/[0.08] text-gray-300 rounded-xl hover:bg-white/[0.03] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              返回项目详情
            </button>
            <button
              onClick={() => router.push('/projects')}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
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
    <div className="min-h-screen bg-[#050510]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-[#00f0ff] transition-colors mb-6"
        >
          <ArrowLeftOutlined className="mr-2" /> 返回项目详情
        </button>

        <div className="holo-card overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-[#0a0a1a] to-[#101025] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />
            <div className="text-white text-center relative z-10">
              <div className="w-16 h-16 bg-white/[0.05] backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/[0.08]">
                {getRequestTypeIcon(requestType)}
              </div>
              <h1 className="text-2xl font-black tracking-tight">{getRequestTypeLabel(requestType)}</h1>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
              <p className="text-sm text-gray-500 mb-2">对接项目</p>
              <p className="font-semibold text-white">{project.title}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {roleOptions.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">对接类型</label>
                  <div className="grid grid-cols-3 gap-3">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRequestType(option.value as ConnectionRequestType)}
                        className={`p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300 ${
                          requestType === option.value
                            ? 'border-[#00f0ff]/50 bg-white/[0.03]'
                            : 'border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <span className="text-lg mb-1 block">{option.value === 'bp_access' ? '📄' : option.value === 'become_mentor' ? '👨‍🏫' : '📦'}</span>
                        <span className="text-sm font-medium text-gray-300">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">补充说明（选填）</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="请简要说明您的背景、优势或合作意向..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 resize-none placeholder:text-gray-600 text-white"
                />
                <p className="mt-2 text-xs text-gray-500">请简要介绍您的背景和合作意向，帮助项目团队更好地了解您</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-white/[0.08] text-gray-300 rounded-xl hover:bg-white/[0.03] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl shadow-sm hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
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
