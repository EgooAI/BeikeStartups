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
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec]/50">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#e8dfd0] opacity-40"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#f59e0b] animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#0a2a5c] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0a2a5c]">创业申请</h1>
          <Link
            href="/applications/create"
            className="bg-gradient-to-r from-[#0a2a5c] to-[#1a4a8a] text-white px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium"
          >
            新建申请
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-[#fefcf8] rounded-2xl border border-[#e8dfd0] shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#0a2a5c]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-[#0a2a5c]/60 mb-4 font-medium">暂无申请记录</p>
            <Link
              href="/applications/create"
              className="text-[#f59e0b] hover:text-[#d97706] font-medium inline-flex items-center"
            >
              创建第一个申请
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-[#fefcf8] rounded-xl border border-[#e8dfd0] shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-[#0a2a5c] mb-2">{app.title}</h3>
                    <p className="text-[#0a2a5c]/60 text-sm mb-2">{app.description}</p>
                    <p className="text-[#0a2a5c]/40 text-xs">创建于 {formatDate(app.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>

                {app.review_note && (
                  <div className="bg-[#faf7f2] p-3 rounded-xl mb-4 border border-[#e8dfd0]/50">
                    <p className="text-sm text-[#0a2a5c]/70">
                      <strong>审核意见：</strong>{app.review_note}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Link
                    href={`/applications/${app.id}`}
                    className="text-[#0a2a5c] hover:text-[#f59e0b] font-medium text-sm transition-colors"
                  >
                    查看详情
                  </Link>

                  {app.status === 'draft' && (
                    <>
                      <Link
                        href={`/applications/create?id=${app.id}`}
                        className="text-[#0a2a5c]/60 hover:text-[#0a2a5c] font-medium text-sm transition-colors"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleSubmit(app.id)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                      >
                        提交审核
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
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
