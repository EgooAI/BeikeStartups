// frontend/components/Recruitments/RecruitmentForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recruitmentApi } from '@/lib/api';

interface RecruitmentFormProps {
  initialData?: {
    title: string;
    description: string;
    requirements: string;
    position: string;
    salary: string;
    deadline: string;
  };
  onSuccess?: () => void;
}

export default function RecruitmentForm({ initialData, onSuccess }: RecruitmentFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    requirements: initialData?.requirements || '',
    position: initialData?.position || '',
    salary: initialData?.salary || '',
    deadline: initialData?.deadline || '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        deadline: formData.deadline || undefined,
      };
      await recruitmentApi.create(data);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/recruitments');
      }
    } catch (err: any) {
      setError(err.message || '创建招募失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          招聘标题 *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={200}
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="例如：诚聘前端开发工程师"
        />
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
          职位名称 *
        </label>
        <input
          type="text"
          id="position"
          name="position"
          required
          maxLength={100}
          value={formData.position}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="例如：前端工程师"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          职位描述 *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="描述工作内容、职责等"
        />
      </div>

      <div>
        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
          任职要求
        </label>
        <textarea
          id="requirements"
          name="requirements"
          rows={4}
          value={formData.requirements}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="列出技能要求、经验要求等"
        />
      </div>

      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
          薪资待遇
        </label>
        <input
          type="text"
          id="salary"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="例如：面议 / 5000-8000元/月"
        />
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
          截止日期
        </label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? '发布中...' : '发布招聘'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}