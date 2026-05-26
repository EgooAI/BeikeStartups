// frontend/app/responses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { responseApi } from '@/lib/api';
import { Response as RecruitmentResponse } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import Link from 'next/link';

export default function ResponsesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [responses, setResponses] = useState<RecruitmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">我的应聘记录</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">暂无应聘记录</p>
            <Link
              href="/recruitments"
              className="text-indigo-600 hover:text-indigo-700 font-medium mt-4 inline-block"
            >
              浏览招聘信息 →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {response.recruitment?.title || '招募'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      职位：{response.recruitment?.position}
                    </p>
                    <p className="text-gray-500 text-xs">
                      申请时间：{formatDate(response.created_at)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(response.status)}`}>
                    {getStatusText(response.status)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 text-sm">{response.cover_letter}</p>
                </div>

                {response.review_note && (
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>回复意见：</strong>{response.review_note}
                    </p>
                  </div>
                )}

                <Link
                  href={`/responses/${response.id}`}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  查看详情
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}