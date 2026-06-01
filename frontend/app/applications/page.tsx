// frontend/app/applications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { applicationApi } from '@/lib/api';
import { Application } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { message } from 'antd';
import Link from 'next/link';

export default function ApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadApplications = async () => {
    try {
      const response = await applicationApi.list();
      if (response.data) {
        const data = response.data as Application[];
        setApplications(data || []);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载申请列表失败';
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
        loadApplications();
      });
    }
  }, [user, authLoading]);

  const handleSubmit = async (id: number) => {
    try {
      await applicationApi.submit(id);
      loadApplications();
      message.success('创业申请已提交');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '提交失败';
      message.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个申请吗？')) return;

    try {
      await applicationApi.delete(id);
      loadApplications();
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

  return (
    <div className="min-h-screen bg-[#050510] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white">创业申请</h1>
          <Link
            href="/applications/create"
            className="bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold px-6 py-2.5 rounded-xl hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-300"
          >
            新建申请
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4 font-medium">暂无申请记录</p>
            <Link
              href="/applications/create"
              className="text-[#ffb800] hover:text-[#ffc800] font-medium inline-flex items-center transition-colors"
            >
              创建第一个申请
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-[#00f0ff]/20 hover:shadow-[0_0_25px_rgba(0,240,255,0.05)] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white mb-2">{app.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{app.description}</p>
                    <p className="text-gray-500 text-xs">创建于 {formatDate(app.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>

                {app.review_note && (
                  <div className="bg-white/[0.03] p-3 rounded-xl mb-4 border border-white/[0.05]">
                    <p className="text-sm text-gray-300">
                      <strong>审核意见：</strong>{app.review_note}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Link
                    href={`/applications/${app.id}`}
                    className="text-[#00f0ff] hover:text-[#00d0ff] font-medium text-sm transition-colors"
                  >
                    查看详情
                  </Link>

                  {app.status === 'draft' && (
                    <>
                      <Link
                        href={`/applications/create?id=${app.id}`}
                        className="text-gray-400 hover:text-white font-medium text-sm transition-colors"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleSubmit(app.id)}
                        className="text-[#00ff88] hover:text-[#00e877] font-medium text-sm transition-colors"
                      >
                        提交审核
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
                      >
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
