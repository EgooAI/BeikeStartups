// frontend/app/responses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { responseApi } from '@/lib/api';
import { Response as RecruitmentResponse } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import Link from 'next/link';
import { InboxOutlined, FileSearchOutlined } from '@ant-design/icons';

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
      <div className="min-h-screen bg-[#f7f3ec]/50 flex items-center justify-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#e8dfd0] border-t-[#0a2a5c] animate-spin" />
          <div className="absolute inset-[4px] rounded-full border-[3px] border-[#e8dfd0] border-b-[#0a2a5c] animate-[spin_0.8s_linear_reverse_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0a2a5c] mb-8">我的应聘记录</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {responses.length === 0 ? (
          <div className="bg-[#fefcf8] border border-[#e8dfd0] rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <InboxOutlined className="text-3xl text-[#8b7e6a]" />
            </div>
            <p className="text-[#8b7e6a] mb-4">暂无应聘记录</p>
            <Link
              href="/recruitments"
              className="text-[#0a2a5c] hover:text-[#0a2a5c]/80 font-medium inline-block"
            >
              浏览招聘信息 →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.id} className="bg-[#fefcf8] border border-[#e8dfd0] rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-[#0a2a5c] mb-2">
                      {response.recruitment?.title || '招募'}
                    </h3>
                    <p className="text-[#8b7e6a] text-sm mb-2">
                      职位：{response.recruitment?.position}
                    </p>
                    <p className="text-[#a89880] text-xs">
                      申请时间：{formatDate(response.created_at)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(response.status)}`}>
                    {getStatusText(response.status)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-[#5c4f3c] text-sm">{response.cover_letter}</p>
                </div>

                {response.review_note && (
                  <div className="bg-[#faf7f2] p-3 rounded-xl border border-[#e8dfd0] mb-4">
                    <p className="text-sm text-[#5c4f3c]">
                      <strong>回复意见：</strong>{response.review_note}
                    </p>
                  </div>
                )}

                <Link
                  href={`/responses/${response.id}`}
                  className="text-[#0a2a5c] hover:text-[#0a2a5c]/80 font-medium text-sm flex items-center gap-1"
                >
                  <FileSearchOutlined className="text-xs" />
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
