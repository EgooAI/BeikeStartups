// frontend/app/responses/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { responseApi } from '@/lib/api';
import { Response as RecruitmentResponse } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { message } from 'antd';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">记录不存在</p>
      </div>
    );
  }

  const isApplicant = response.user_id === user?.id;
  const isTeamOwner = response.recruitment?.team?.owner_id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canReview = isTeamOwner || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-700 mb-4"
          >
            ← 返回
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {response.recruitment?.title}
              </h1>
              <p className="text-indigo-600 font-medium mb-2">
                {response.recruitment?.position}
              </p>
              <p className="text-gray-500 text-sm">
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">求职信</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{response.cover_letter}</p>
            </div>

            {response.resume && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">简历</h2>
                <a
                  href={response.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  查看简历 →
                </a>
              </div>
            )}

            {response.review_note && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">回复意见</h2>
                <p className="text-gray-700">{response.review_note}</p>
              </div>
            )}
          </div>

          {canReview && response.status === 'pending' && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">审核操作</h3>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="输入回复意见..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                rows={3}
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleAccept}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  录取
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  拒绝
                </button>
              </div>
            </div>
          )}

          {isApplicant && response.status === 'pending' && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleInvalidate}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
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