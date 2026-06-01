// frontend/app/applications/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { applicationApi } from '@/lib/api';
import { Application } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { message } from 'antd';

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const router = useRouter();
  const appId = parseInt(id);

  const loadApplication = async () => {
    try {
      const response = await applicationApi.get(appId);
      if (response.data) {
        setApplication(response.data as Application);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载申请详情失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      requestAnimationFrame(() => {
        loadApplication();
      });
    }
  }, [user, authLoading]);

  const handleSubmit = async () => {
    try {
      await applicationApi.submit(appId);
      loadApplication();
      message.success('创业申请已提交');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '提交失败';
      message.error(errorMessage);
    }
  };

  const handleApprove = async () => {
    if (!reviewNote.trim()) {
      message.warning('请输入审核意见');
      return;
    }
    try {
      await applicationApi.approve(appId, reviewNote);
      loadApplication();
      setReviewNote('');
      message.success('已通过创业申请');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '审批失败';
      message.error(errorMessage);
    }
  };

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      message.warning('请输入审核意见');
      return;
    }
    try {
      await applicationApi.reject(appId, reviewNote);
      loadApplication();
      setReviewNote('');
      message.success('已拒绝创业申请');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '拒绝失败';
      message.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个申请吗？')) return;

    try {
      await applicationApi.delete(appId);
      router.push('/applications');
      message.success('申请已删除');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除失败';
      message.error(errorMessage);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510]">
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">申请不存在</p>
        </div>
      </div>
    );
  }

  const canReview = user?.role === 'admin' || user?.role === 'mentor';
  const isOwner = application.user_id === user?.id;

  return (
    <div className="min-h-screen bg-[#050510] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 transition-colors font-medium inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            返回列表
          </button>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-2">{application.title}</h1>
              <p className="text-gray-500 text-sm">
                创建于 {formatDate(application.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {getStatusText(application.status)}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black tracking-tight text-white mb-2">项目描述</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{application.description}</p>
            </div>

            {application.business_plan && (
              <div>
                <h2 className="text-lg font-black tracking-tight text-white mb-2">商业计划</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{application.business_plan}</p>
              </div>
            )}

            {application.review_note && (
              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.05]">
                <h2 className="text-lg font-black tracking-tight text-white mb-2">审核意见</h2>
                <p className="text-gray-300">{application.review_note}</p>
                {application.reviewed_at && (
                  <p className="text-gray-500 text-sm mt-2">
                    审核时间：{formatDate(application.reviewed_at)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex space-x-4">
            {application.status === 'draft' && isOwner && (
              <>
                <button
                  onClick={handleSubmit}
                  className="bg-[#00ff88] text-[#050510] px-6 py-2.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-105 transition-all duration-300"
                >
                  提交审核
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500/80 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-500 hover:scale-105 transition-all duration-300"
                >
                  删除申请
                </button>
              </>
            )}

            {canReview && application.status === 'pending' && (
              <div className="w-full space-y-4">
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="输入审核意见..."
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:border-[#00f0ff]/40 focus:ring-[#00f0ff]/10 focus:ring-2 focus:outline-none transition-all resize-none text-white placeholder:text-gray-500"
                  rows={3}
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleApprove}
                    className="bg-[#00ff88] text-[#050510] px-6 py-2.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-105 transition-all duration-300"
                  >
                    通过
                  </button>
                  <button
                    onClick={handleReject}
                    className="bg-red-500/80 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-500 hover:scale-105 transition-all duration-300"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
