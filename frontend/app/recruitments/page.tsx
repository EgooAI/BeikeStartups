// frontend/app/recruitments/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { recruitmentApi } from '@/lib/api';
import { Recruitment } from '@/types';
import { formatDate, getStatusColor, getStatusText, truncateText } from '@/lib/utils';
import Link from 'next/link';

export default function RecruitmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadRecruitments();
    }
  }, [user, authLoading]);

  const loadRecruitments = async () => {
    try {
      const response = await recruitmentApi.list();
      if (response.data) {
        setRecruitments(response.data as Recruitment[]);
      }
    } catch (err: any) {
      setError(err.message || '加载招募列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">人才招聘</h1>
          <Link
            href="/recruitments/create"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            发布招聘
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {recruitments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">暂无招聘信息</p>
            <Link
              href="/recruitments/create"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              发布第一个招聘 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recruitments.map((recruitment) => (
              <div key={recruitment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{recruitment.title}</h3>
                    <p className="text-indigo-600 font-medium mb-2">{recruitment.position}</p>
                    {recruitment.salary && (
                      <p className="text-green-600 text-sm mb-2">{recruitment.salary}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(recruitment.status)}`}>
                    {getStatusText(recruitment.status)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {truncateText(recruitment.description, 100)}
                </p>

                {recruitment.team && (
                  <p className="text-gray-500 text-xs mb-2">团队：{recruitment.team.name}</p>
                )}

                {recruitment.deadline && (
                  <p className="text-gray-500 text-xs mb-4">
                    截止日期：{formatDate(recruitment.deadline)}
                  </p>
                )}

                <Link
                  href={`/recruitments/${recruitment.id}`}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  查看详情 →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}