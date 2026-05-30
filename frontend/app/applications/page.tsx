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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadApplications();
    }
  }, [user, authLoading]);

  const loadApplications = async () => {
    try {
      const response = await applicationApi.list();
      if (response.data) {
        const data = response.data as any;
        setApplications(data.items || data || []);
      }
    } catch (err: any) {
      setError(err.message || '加载申请列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (id: number) => {
    try {
      await applicationApi.submit(id);
      loadApplications();
      message.success('创业申请已提交');
    } catch (err: any) {
      message.error(err.message || '提交失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个申请吗？')) return;

    try {
      await applicationApi.delete(id);
      loadApplications();
      message.success('申请已删除');
    } catch (err: any) {
      message.error(err.message || '删除失败');
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
          <h1 className="text-3xl font-bold text-gray-900">创业申请</h1>
          <Link
            href="/applications/create"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            新建申请
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">暂无申请记录</p>
            <Link
              href="/applications/create"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              创建第一个申请 →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{app.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{app.description}</p>
                    <p className="text-gray-500 text-xs">创建于 {formatDate(app.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>

                {app.review_note && (
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>审核意见：</strong>{app.review_note}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Link
                    href={`/applications/${app.id}`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    查看详情
                  </Link>
                  
                  {app.status === 'draft' && (
                    <>
                      <Link
                        href={`/applications/create?id=${app.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleSubmit(app.id)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        提交审核
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
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