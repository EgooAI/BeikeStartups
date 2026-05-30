// frontend/components/Applications/ApplicationList.tsx
'use client';

import { useEffect, useState } from 'react';
import { applicationApi } from '@/lib/api';
import { Application } from '@/types';
import ApplicationCard from './ApplicationCard';
import Loading from '@/components/Common/Loading';

export default function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = async () => {
    try {
      const response = await applicationApi.list();
      if (response.data) {
        setApplications(response.data as Application[]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载申请列表失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      loadApplications();
    });
  }, []);

  const handleSubmit = async (id: number) => {
    try {
      await applicationApi.submit(id);
      loadApplications();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '提交失败';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个申请吗？')) return;

    try {
      await applicationApi.delete(id);
      loadApplications();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除失败';
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return <Loading size="large" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">暂无申请记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
          application={app}
          showActions={true}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}