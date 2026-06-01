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
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-tight text-white mb-8">我的应聘记录</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {responses.length === 0 ? (
          <div className="holo-card p-12 text-center">
            <div className="w-20 h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/[0.06]">
              <InboxOutlined className="text-3xl text-gray-500" />
            </div>
            <p className="text-gray-400 mb-4">暂无应聘记录</p>
            <Link
              href="/recruitments"
              className="text-[#00f0ff] hover:text-[#00c8ff] font-medium inline-block"
            >
              浏览招聘信息 →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.id} className="holo-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white mb-2">
                      {response.recruitment?.title || '招募'}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
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
                  <p className="text-gray-300 text-sm">{response.cover_letter}</p>
                </div>

                {response.review_note && (
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] mb-4">
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">回复意见：</strong>{response.review_note}
                    </p>
                  </div>
                )}

                <Link
                  href={`/responses/${response.id}`}
                  className="text-[#00f0ff] hover:text-[#00c8ff] font-medium text-sm flex items-center gap-1"
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
