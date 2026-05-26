// frontend/components/Recruitments/RecruitmentList.tsx
'use client';

import { useEffect, useState } from 'react';
import { recruitmentApi } from '@/lib/api';
import { Recruitment } from '@/types';
import RecruitmentCard from './RecruitmentCard';
import Loading from '@/components/Common/Loading';

export default function RecruitmentList() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecruitments();
  }, []);

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

  if (recruitments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">暂无招聘信息</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recruitments.map((recruitment) => (
        <RecruitmentCard key={recruitment.id} recruitment={recruitment} />
      ))}
    </div>
  );
}