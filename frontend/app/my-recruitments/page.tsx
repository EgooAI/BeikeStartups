'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { recruitmentApi } from '@/lib/api';
import { Recruitment } from '@/types';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';

export default function MyRecruitmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      (async () => {
        try {
          setLoading(true);
          const isOwner = user.role === 'team_owner';
          const res = await recruitmentApi.list(undefined, isOwner);
          if (res.data) {
            const data = res.data as { items?: Recruitment[] };
            setRecruitments(data.items || []);
          }
        } catch (err) {
          console.error('Failed to load recruitments:', err);
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <p className="text-gray-400">请先登录</p>
      </div>
    );
  }

  if (authLoading || loading) {
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
    <div className="min-h-screen bg-[#050510]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          返回主页
        </Link>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">我的招募</h1>
            <p className="text-gray-400 mt-1">管理您的招募信息</p>
          </div>
          <Link
            href="/recruitments/create"
            className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl shadow-sm hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex items-center"
          >
            <PlusOutlined className="mr-2" />发布招募
          </Link>
        </div>

        {recruitments.length === 0 ? (
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TeamOutlined className="text-2xl text-gray-500" />
            </div>
            <p className="text-gray-400 mb-4 font-medium">暂无招募信息</p>
            <Link
              href="/recruitments/create"
              className="text-[#ffb800] hover:text-[#ffc800] font-medium inline-flex items-center transition-colors"
            >
              发布第一个招募
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recruitments.map((rec) => (
              <Link
                key={rec.id}
                href={`/recruitments/${rec.id}`}
                className="block bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-[#00f0ff]/20 hover:shadow-[0_0_25px_rgba(0,240,255,0.05)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b347ea]/10 to-[#b347ea]/5 flex items-center justify-center">
                      <TeamOutlined className="text-[#b347ea]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{rec.position}</h3>
                      <p className="text-sm text-gray-400">{rec.title}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    rec.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88]' :
                    rec.status === 'solved' ? 'bg-[#00f0ff]/10 text-[#00f0ff]' :
                    'bg-white/[0.05] text-gray-400'
                  }`}>
                    {rec.status === 'active' ? '招募中' : rec.status === 'solved' ? '已解决' : '已关闭'}
                  </span>
                </div>
                {rec.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{rec.description}</p>
                )}
                {rec.requirements && (
                  <div className="flex flex-wrap gap-1.5">
                    {rec.requirements.split('\n').filter(Boolean).slice(0, 3).map((req, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/[0.04] text-gray-400 rounded-lg text-xs">{req}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
