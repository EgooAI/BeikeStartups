// frontend/app/recruitments/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { recruitmentApi } from '@/lib/api';
import { TeamOutlined } from '@ant-design/icons';

const POSITION_OPTIONS = [
  { value: 'frontend', label: '前端开发', requirement: '熟悉 Vue / React，有项目经验优先' },
  { value: 'backend', label: '后端开发', requirement: '熟悉 FastAPI / Spring Boot' },
  { value: 'product', label: '产品经理', requirement: '能做用户调研、原型设计、需求文档' },
  { value: 'operation', label: '校园运营', requirement: '熟悉社群运营、活动策划、内容推广' },
  { value: 'other', label: '其他', requirement: '' },
];

export default function CreateRecruitmentPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: POSITION_OPTIONS[0]?.requirement || '',
    position: POSITION_OPTIONS[0]?.value || '',
    customPosition: '',
    deadline: '',
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

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    const selectedOption = POSITION_OPTIONS.find(opt => opt.value === selectedValue);
    const newRequirements = selectedOption?.requirement || '';

    setFormData({
      ...formData,
      position: selectedValue,
      requirements: newRequirements,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const submitPosition = formData.position === 'other' ? formData.customPosition : formData.position;
      const data = {
        ...formData,
        position: submitPosition,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      };
      await recruitmentApi.create(data);
      router.push('/recruitments');
    } catch (err: any) {
      setError(err.message || '创建招募失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#f7f3ec] to-[#faf7f2]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-accent/30 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">正在加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
              <TeamOutlined className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-primary">发布招聘</h1>
              <p className="mt-1 text-gray-500">寻找优秀的团队成员</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-panel p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
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
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="例如：诚聘前端开发工程师"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
              招募岗位 *
            </label>
            <select
              id="position"
              name="position"
              required
              value={formData.position}
              onChange={handlePositionChange}
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {POSITION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {formData.position === 'other' && (
            <div>
              <label htmlFor="customPosition" className="block text-sm font-medium text-gray-700 mb-2">
                自定义岗位名称 *
              </label>
              <input
                type="text"
                id="customPosition"
                name="customPosition"
                required
                maxLength={100}
                value={formData.customPosition}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="请输入自定义岗位名称"
              />
            </div>
          )}

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
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
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
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="列出技能要求、经验要求等"
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
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex space-x-4 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  发布中...
                </span>
              ) : '发布招聘'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-[#e8dfd0] rounded-xl text-gray-600 hover:bg-[#faf7f2] hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
