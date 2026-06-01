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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050510]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
        <p className="text-gray-500 text-sm animate-pulse">正在加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00f0ff] to-[#00c8ff] rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <TeamOutlined className="text-xl text-[#050510]" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">发布招聘</h1>
              <p className="mt-1 text-gray-400">寻找优秀的团队成员</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="holo-card p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
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
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 transition-all text-white placeholder:text-gray-500"
              placeholder="例如：诚聘前端开发工程师"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-2">
              招募岗位 *
            </label>
            <select
              id="position"
              name="position"
              required
              value={formData.position}
              onChange={handlePositionChange}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 transition-all text-white"
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
              <label htmlFor="customPosition" className="block text-sm font-medium text-gray-300 mb-2">
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
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 transition-all text-white placeholder:text-gray-500"
                placeholder="请输入自定义岗位名称"
              />
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              职位描述 *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 transition-all resize-none text-white placeholder:text-gray-500"
              placeholder="描述工作内容、职责等"
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-300 mb-2">
              任职要求
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={4}
              value={formData.requirements}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 transition-all resize-none text-white placeholder:text-gray-500"
              placeholder="列出技能要求、经验要求等"
            />
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
              截止日期
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 transition-all text-white"
            />
          </div>

          <div className="flex space-x-4 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold py-3 px-6 rounded-xl shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#050510] border-t-transparent" />
                  发布中...
                </span>
              ) : '发布招聘'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-white/10 rounded-xl text-white hover:bg-white/[0.03] hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
