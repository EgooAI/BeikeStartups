// frontend/app/projects/create/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectApi, uploadApi } from '@/lib/api';

const INDUSTRY_OPTIONS = [
  'AI',
  '教育',
  '消费',
  '硬件',
  '文创',
  '企业服务',
];

const STAGE_OPTIONS = [
  { value: 'idea', label: '创意阶段' },
  { value: 'seed', label: '种子计划' },
  { value: 'prototype', label: '原型开发' },
  { value: 'launched', label: '产品上线' },
  { value: 'revenue', label: '营收验证' },
];

export default function CreateProjectPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    cover_image: '',
    is_public: true,
    tags: '',
    industry: '',
    stage: 'idea',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleIndustryChange = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industry: prev.industry === industry ? '' : industry,
    }));
  };

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      stage: e.target.value,
    });
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.industry) {
      setError('请选择项目所属领域');
      return;
    }
    
    setIsLoading(true);

    try {
      let coverImageUrl = formData.cover_image;
      if (coverFile) {
        const uploadRes = await uploadApi.upload(coverFile);
        if (!uploadRes.data?.url) {
          throw new Error('图片上传失败，未返回图片地址');
        }
        coverImageUrl = uploadRes.data.url;
      }
      await projectApi.create({
        ...formData,
        cover_image: coverImageUrl,
      });
      router.push('/my-projects');
    } catch (err: any) {
      setError(err.message || '创建项目失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 普通学生用户禁止创建项目
  if (user?.role === 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-custom-lg p-12 max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#0a2a5c] mb-3">无权创建项目</h2>
          <p className="text-gray-500 mb-8">普通学生用户无法创建项目，请先申请成为团队角色</p>
          <button
            onClick={() => router.push('/my-projects')}
            className="inline-flex items-center px-8 py-3 bg-[#0a2a5c] text-white font-semibold rounded-xl hover:bg-[#0a2a5c]/90 transition-colors"
          >
            返回我的项目
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">创建项目</h1>
          <p className="mt-2 text-gray-600">展示您的创新成果</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              项目名称 *
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
              placeholder="输入项目名称"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              项目描述 *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="简要描述您的项目"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              详细内容
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="详细描述项目内容、技术实现等"
            />
          </div>

          <div>
            <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-2">
              封面图片上传
            </label>
            <input
              type="file"
              id="cover_image"
              name="cover_image"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="w-full text-sm text-gray-600"
            />
            {coverPreview && (
              <img
                src={coverPreview}
                alt="封面预览"
                className="mt-4 w-full max-h-60 object-cover rounded-lg border border-gray-200"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目领域 *
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map(industry => (
                <button
                  key={industry}
                  type="button"
                  onClick={() => handleIndustryChange(industry)}
                  className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-colors ${
                    formData.industry === industry
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
              项目阶段 *
            </label>
            <select
              id="stage"
              name="stage"
              required
              value={formData.stage}
              onChange={handleStageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {STAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="用逗号分隔多个标签，如：AI,Web,移动应用"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
              公开项目（其他人可以查看）
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? '创建中...' : '创建项目'}
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
      </div>
    </div>
  );
}