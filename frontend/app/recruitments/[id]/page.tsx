// frontend/app/recruitments/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { recruitmentApi } from '@/lib/api';
import { Recruitment } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';

export default function RecruitmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const recruitmentId = parseInt(id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadRecruitment();
    }
  }, [user, authLoading]);

  const loadRecruitment = async () => {
    try {
      const response = await recruitmentApi.get(recruitmentId);
      if (response.data) {
        setRecruitment(response.data as Recruitment);
      }
    } catch (err: any) {
      setError(err.message || '加载招募详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolve = async () => {
    try {
      await recruitmentApi.solve(recruitmentId);
      loadRecruitment();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleInvalidate = async () => {
    if (!confirm('确定要作废这个招募吗？')) return;
    
    try {
      await recruitmentApi.invalidate(recruitmentId);
      loadRecruitment();
    } catch (err: any) {
      alert(err.message || '作废失败');
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个招募吗？')) return;
    
    try {
      await recruitmentApi.delete(recruitmentId);
      router.push('/recruitments');
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

  if (!recruitment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">招募不存在</p>
      </div>
    );
  }

  const isOwner = recruitment.team?.owner_id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canManage = isOwner || isAdmin;

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{recruitment.title}</h1>
              <p className="text-indigo-600 text-xl font-medium mb-2">{recruitment.position}</p>
              {recruitment.salary && (
                <p className="text-green-600 mb-2">{recruitment.salary}</p>
              )}
              <p className="text-gray-500 text-sm">
                发布于 {formatDate(recruitment.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(recruitment.status)}`}>
              {getStatusText(recruitment.status)}
            </span>
          </div>

          {recruitment.team && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-gray-600">
                <strong>招聘团队：</strong>{recruitment.team.name}
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">职位描述</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{recruitment.description}</p>
            </div>

            {recruitment.requirements && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">任职要求</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{recruitment.requirements}</p>
              </div>
            )}

            {recruitment.deadline && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800">
                  <strong>截止日期：</strong>{formatDate(recruitment.deadline)}
                </p>
              </div>
            )}
          </div>

          {canManage && recruitment.status === 'active' && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">管理操作</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleSolve}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  标记为已解决
                </button>
                
                <button
                  onClick={handleInvalidate}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  作废招募
                </button>

                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    删除招募
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}