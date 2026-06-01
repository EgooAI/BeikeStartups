// frontend/app/responses/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { responseApi } from '@/lib/api';
import { Response as RecruitmentResponse } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { message } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

export default function ResponseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [response, setResponse] = useState<RecruitmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const router = useRouter();
  const responseId = parseInt(id);

  const loadResponse = async () => {
    try {
      const result = await responseApi.get(responseId);
      if (result.data) {
        setResponse(result.data as RecruitmentResponse);
      }
    } catch (err: unknown) {
      setError((err as Error).message || '加载详情失败');
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
        loadResponse();
      });
    }
  }, [user, authLoading]);

  const handleAccept = async () => {
    if (!reviewNote.trim()) {
      message.warning('请输入回复意见');
      return;
    }
    try {
      await responseApi.accept(responseId, reviewNote);
      loadResponse();
      setReviewNote('');
      message.success('已通过申请');
    } catch (err: unknown) {
      message.error((err as Error).message || '操作失败');
    }
  };

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      message.warning('请输入回复意见');
      return;
    }
    try {
      await responseApi.reject(responseId, reviewNote);
      loadResponse();
      setReviewNote('');
      message.success('已拒绝申请');
    } catch (err: unknown) {
      message.error((err as Error).message || '操作失败');
    }
  };

  const handleInvalidate = async () => {
    if (!confirm('确定要作废这个应聘吗？')) return;

    try {
      await responseApi.invalidate(responseId);
      loadResponse();
      message.success('应聘已作废');
    } catch (err: unknown) {
      message.error((err as Error).message || '作废失败');
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个应聘记录吗？')) return;

    try {
      await responseApi.delete(responseId);
      router.push('/responses');
      message.success('应聘记录已删除');
    } catch (err: unknown) {
      message.error((err as Error).message || '删除失败');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/[0.06]">
            <ExclamationCircleOutlined className="text-3xl text-gray-500" />
          </div>
          <p className="text-gray-400">记录不存在</p>
        </div>
      </div>
    );
  }

  const isApplicant = response.user_id === user?.id;
  const isTeamOwner = response.recruitment?.team?.owner_id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canReview = isTeamOwner || isAdmin;

  return (
    <div className="min-h-screen bg-[#050510] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-[#00f0ff] transition-colors"
          >
            <ArrowLeftOutlined className="mr-2" /> 返回
          </button>
        </div>

        <div className="holo-card p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white mb-2">
                {response.recruitment?.title}
              </h1>
              <p className="text-white font-medium mb-2 flex items-center gap-1.5">
                <FileTextOutlined className="text-sm text-[#00f0ff]" />
                {response.recruitment?.position}
              </p>
              <p className="text-gray-400 text-sm flex items-center gap-1.5">
                <UserOutlined className="text-xs" />
                申请人：{response.user?.nickname || response.user?.username}
              </p>
              <p className="text-gray-500 text-sm">
                申请时间：{formatDate(response.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(response.status)}`}>
              {getStatusText(response.status)}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black tracking-tight text-white mb-2">求职信</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{response.cover_letter}</p>
            </div>

            {response.resume && (
              <div>
                <h2 className="text-lg font-black tracking-tight text-white mb-2">简历</h2>
                <a
                  href={response.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00f0ff] hover:text-[#00c8ff] font-medium"
                >
                  查看简历 →
                </a>
              </div>
            )}

            {response.review_note && (
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
                <h2 className="text-lg font-black tracking-tight text-white mb-2">回复意见</h2>
                <p className="text-gray-300">{response.review_note}</p>
              </div>
            )}
          </div>

          {canReview && response.status === 'pending' && (
            <div className="mt-8 pt-8 border-t border-white/[0.06]">
              <h3 className="text-lg font-black tracking-tight text-white mb-4">审核操作</h3>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="输入回复意见..."
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 focus:outline-none placeholder:text-gray-600 text-white mb-4 resize-none"
                rows={3}
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleAccept}
                  className="bg-[#00ff88] text-[#050510] font-bold px-6 py-2.5 rounded-xl hover:bg-[#00ff88]/90 shadow-sm hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  录取
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  拒绝
                </button>
              </div>
            </div>
          )}

          {isApplicant && response.status === 'pending' && (
            <div className="mt-8 pt-8 border-t border-white/[0.06]">
              <button
                onClick={handleInvalidate}
                className="bg-white/[0.05] text-gray-300 px-6 py-2.5 rounded-xl hover:bg-white/[0.08] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium"
              >
                撤回申请
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
