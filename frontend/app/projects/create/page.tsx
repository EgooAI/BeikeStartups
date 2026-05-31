// frontend/app/projects/create/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectApi, uploadApi } from '@/lib/api';

const DOMAIN_OPTIONS = [
  { value: 'ai', label: 'AI' },
  { value: 'education', label: '教育' },
  { value: 'consumer', label: '消费' },
  { value: 'hardware', label: '硬件' },
  { value: 'culture', label: '文创' },
  { value: 'enterprise', label: '企业服务' },
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
    domains: [] as string[],
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

  const handleDomainChange = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter(d => d !== domain)
        : [...prev.domains, domain],
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

    if (formData.domains.length === 0) {
      setError('请至少选择一个项目领域');
      return;
    }

    setIsLoading(true);

    try {
      let coverImageUrl = formData.cover_image;
      if (coverFile) {
        const uploadRes = await uploadApi.upload(coverFile);
        coverImageUrl = uploadRes.data?.url || '';
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0a2a5c]">创建项目</h1>
          <p className="mt-2 text-[#8b7e6a]">展示您的创新成果</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#fefcf8] border border-[#e8dfd0] rounded-2xl shadow-sm p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#5c4f3c] mb-2">
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
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] focus:outline-none placeholder:text-[#c4b99a]"
              placeholder="输入项目名称"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#5c4f3c] mb-2">
              项目描述 *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] focus:outline-none placeholder:text-[#c4b99a] resize-none"
              placeholder="简要描述您的项目"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-[#5c4f3c] mb-2">
              详细内容
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] focus:outline-none placeholder:text-[#c4b99a] resize-none"
              placeholder="详细描述项目内容、技术实现等"
            />
          </div>

          <div>
            <label htmlFor="cover_image" className="block text-sm font-medium text-[#5c4f3c] mb-2">
              封面图片上传
            </label>
            <input
              type="file"
              id="cover_image"
              name="cover_image"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="w-full text-sm text-[#8b7e6a] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#f5f0e8] file:text-[#5c4f3c] hover:file:bg-[#e8dfd0] file:cursor-pointer file:transition-colors"
            />
            {coverPreview && (
              <img
                src={coverPreview}
                alt="封面预览"
                className="mt-4 w-full max-h-60 object-cover rounded-xl border border-[#e8dfd0]"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5c4f3c] mb-2">
              项目领域 *
            </label>
            <div className="flex flex-wrap gap-2">
              {DOMAIN_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className={`px-4 py-2 rounded-xl text-sm cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                    formData.domains.includes(option.value)
                      ? 'bg-[#0a2a5c] text-white'
                      : 'bg-[#f5f0e8] text-[#8b7e6a] hover:bg-[#e8dfd0]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.domains.includes(option.value)}
                    onChange={() => handleDomainChange(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-[#5c4f3c] mb-2">
              项目阶段 *
            </label>
            <select
              id="stage"
              name="stage"
              required
              value={formData.stage}
              onChange={handleStageChange}
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] focus:outline-none"
            >
              {STAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-[#5c4f3c] mb-2">
              标签
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] focus:outline-none placeholder:text-[#c4b99a]"
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
              className="h-4 w-4 text-[#0a2a5c] focus:ring-[#0a2a5c]/20 border-[#e8dfd0] rounded"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-[#5c4f3c]">
              公开项目（其他人可以查看）
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#0a2a5c] text-white py-3 px-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 font-medium"
            >
              {isLoading ? '创建中...' : '创建项目'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-[#e8dfd0] rounded-xl hover:bg-[#faf7f2] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-[#5c4f3c]"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
