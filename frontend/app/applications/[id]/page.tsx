// frontend/app/applications/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { applicationApi } from '@/lib/api';
import { Application } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const router = useRouter();
  const appId = parseInt(id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadApplication();
    }
  }, [user, authLoading]);

  const loadApplication = async () => {
    try {
      const response = await applicationApi.get(appId);
      if (response.data) {
        setApplication(response.data as Application);
      }
    } catch (err: any) {
      setError(err.message || '加载申请详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await applicationApi.submit(appId);
      loadApplication();
    } catch (err: any) {
      alert(err.message || '提交失败');
    }
  };

  const handleApprove = async () => {
    if (!reviewNote.trim()) {
      alert('请输入审核意见');
      return;
    }
    try {
      await applicationApi.approve(appId, reviewNote);
      loadApplication();
      setReviewNote('');
    } catch (err: any) {
      alert(err.message || '审批失败');
    }
  };

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      alert('请输入审核意见');
      return;
    }
    try {
      await applicationApi.reject(appId, reviewNote);
      loadApplication();
      setReviewNote('');
    } catch (err: any) {
      alert(err.message || '拒绝失败');
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个申请吗？')) return;
    
    try {
      await applicationApi.delete(appId);
      router.push('/applications');
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">申请不存在</p>
      </div>
    );
  }

  const canReview = user?.role === 'admin' || user?.role === 'mentor';
  const isOwner = application.user_id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-700 mb-4"
          >
            ← 返回列表
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{application.title}</h1>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">项目描述</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{application.description}</p>
            </div>

            {application.business_plan && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">商业计划</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{application.business_plan}</p>
              </div>
            )}

            {application.review_note && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">审核意见</h2>
                <p className="text-gray-700">{application.review_note}</p>
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
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  提交审核
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleApprove}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    通过
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
          </div>
        </div>
      </div>
    </div>
  );
}