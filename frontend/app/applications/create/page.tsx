'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { applicationApi } from '@/lib/api';
import Link from 'next/link';
import {
  TeamOutlined,
  FileTextOutlined,
  BulbOutlined,
  GlobalOutlined,
  FlagOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TagsOutlined,
  FundOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

const projectCategories = [
  '人工智能', '大数据', '物联网', '区块链', '生物医药',
  '新能源', '新材料', '文化创意', '教育培训', '电商零售',
  '企业服务', '医疗健康', '金融科技', '农业科技', '其他',
];

const teamSizes = [
  { value: '1', label: '1人（独立创业者）' },
  { value: '2-3', label: '2-3人' },
  { value: '4-6', label: '4-6人' },
  { value: '7-10', label: '7-10人' },
  { value: '10+', label: '10人以上' },
];

const stages = [
  { value: 'idea', label: '创意阶段', desc: '仅有创意概念，尚未开始执行' },
  { value: 'prototype', label: '原型阶段', desc: '已有产品原型或MVP' },
  { value: 'seed', label: '种子轮', desc: '已完成初步验证，寻找种子投资' },
  { value: 'growth', label: '成长期', desc: '已有稳定用户和收入，寻求规模化' },
];

export default function CreateApplicationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    business_plan: '',
    category: '',
    team_size: '',
    stage: '',
    market_analysis: '',
    competitive_advantage: '',
    team_introduction: '',
    contact_email: '',
    contact_phone: '',
    tags: '',
  });

  const totalSteps = 4;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const submitData = {
        title: formData.title,
        description: `【项目类别】${formData.category}
【团队规模】${formData.team_size}
【项目阶段】${formData.stage}

${formData.description}

【市场分析】
${formData.market_analysis}

【竞争优势】
${formData.competitive_advantage}

【团队介绍】
${formData.team_introduction}

【联系方式】
邮箱：${formData.contact_email}
电话：${formData.contact_phone}
标签：${formData.tags}`,
        business_plan: formData.business_plan,
      };

      await applicationApi.create(submitData);
      router.push('/applications');
    } catch (err: any) {
      setError(err.message || '创建申请失败');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.title) { setError('请填写项目名称'); return; }
    if (step === 1 && !formData.category) { setError('请选择项目类别'); return; }
    if (step === 2 && !formData.description) { setError('请填写项目描述'); return; }
    setError('');
    setStep(Math.min(step + 1, totalSteps));
  };

  const prevStep = () => {
    setError('');
    setStep(Math.max(step - 1, 1));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a2a5c]/5 via-white to-[#f59e0b]/5">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a2a5c]/5 via-white to-[#f59e0b]/5">
        <div className="text-center bg-white rounded-2xl shadow-custom-lg p-12 max-w-md">
          <SafetyOutlined className="text-5xl text-[#f59e0b] mb-4" />
          <p className="text-gray-500 mb-6 text-lg">请先登录后再提交创业申请</p>
          <Link href="/login" className="inline-block px-8 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2a5c]/5 via-white to-[#f59e0b]/5 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/applications" className="inline-flex items-center text-[#0a2a5c]/60 hover:text-[#0a2a5c] mb-4 transition-colors">
            <ArrowLeftOutlined className="mr-2" />
            返回申请列表
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] rounded-2xl flex items-center justify-center">
              <TeamOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0a2a5c]">创业团队认证申请</h1>
              <p className="text-gray-500 mt-1">提交你的创业想法，开启校园创业之旅</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-custom p-6 mb-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: '项目信息', icon: <FileTextOutlined /> },
              { num: 2, label: '项目详情', icon: <BulbOutlined /> },
              { num: 3, label: '团队与市场', icon: <GlobalOutlined /> },
              { num: 4, label: '提交审核', icon: <FlagOutlined /> },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    step > s.num
                      ? 'bg-green-500 text-white'
                      : step === s.num
                      ? 'bg-[#0a2a5c] text-white shadow-lg shadow-[#0a2a5c]/20'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.num ? <CheckCircleOutlined /> : s.icon}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium ${
                    step >= s.num ? 'text-[#0a2a5c]' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 mt-[-1.5rem] ${
                    step > s.num ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-custom-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                <FileTextOutlined className="text-2xl text-[#0a2a5c]" />
                <h2 className="text-xl font-semibold text-[#0a2a5c]">项目基本信息</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  placeholder="给你的创业项目取一个响亮的名字"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目类别 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {projectCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        formData.category === cat
                          ? 'bg-[#0a2a5c] text-white border-[#0a2a5c] shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#0a2a5c]/30 hover:text-[#0a2a5c]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">团队规模</label>
                  <select
                    name="team_size"
                    value={formData.team_size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] bg-white"
                  >
                    <option value="">请选择团队规模</option>
                    {teamSizes.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">项目阶段</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] bg-white"
                  >
                    <option value="">请选择项目阶段</option>
                    {stages.map((s) => (
                      <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目标签
                </label>
                <div className="relative">
                  <TagsOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="用逗号分隔，如：人工智能,教育,移动端"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                <BulbOutlined className="text-2xl text-[#0a2a5c]" />
                <h2 className="text-xl font-semibold text-[#0a2a5c]">项目详细描述</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目简介 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="简要描述你的项目是做什么的，解决了什么问题"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商业计划书
                </label>
                <textarea
                  name="business_plan"
                  value={formData.business_plan}
                  onChange={handleChange}
                  rows={8}
                  placeholder="详细描述你的商业模式、收入来源、成本结构、盈利预测等"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                />
                <p className="mt-1.5 text-xs text-gray-400">完整的商业计划书有助于提高申请通过率</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  市场分析
                </label>
                <textarea
                  name="market_analysis"
                  value={formData.market_analysis}
                  onChange={handleChange}
                  rows={4}
                  placeholder="描述目标市场规模、用户画像、市场趋势等"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  竞争优势
                </label>
                <textarea
                  name="competitive_advantage"
                  value={formData.competitive_advantage}
                  onChange={handleChange}
                  rows={4}
                  placeholder="分析你的核心竞争力、技术壁垒、与竞品的差异等"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 3: Team & Contact */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                <GlobalOutlined className="text-2xl text-[#0a2a5c]" />
                <h2 className="text-xl font-semibold text-[#0a2a5c]">团队介绍与联系方式</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  团队介绍
                </label>
                <textarea
                  name="team_introduction"
                  value={formData.team_introduction}
                  onChange={handleChange}
                  rows={4}
                  placeholder="介绍核心团队成员的教育背景、工作经验、擅长领域等"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                />
                <p className="mt-1.5 text-xs text-gray-400">介绍团队的亮点和互补性，让审核方更了解你们</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系邮箱
                  </label>
                  <div className="relative">
                    <MailOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话
                  </label>
                  <div className="relative">
                    <PhoneOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      placeholder="请输入手机号"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <BulbOutlined className="text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">申请提示</p>
                    <p className="text-xs text-amber-700 mt-1">
                      请确保联系方式准确有效，审核结果将通过站内信和邮件通知。完整的项目信息有助于提高审核通过率。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                <FlagOutlined className="text-2xl text-[#0a2a5c]" />
                <h2 className="text-xl font-semibold text-[#0a2a5c]">确认并提交</h2>
              </div>

              <div className="bg-gradient-to-br from-[#0a2a5c]/5 to-[#f59e0b]/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircleOutlined className="text-green-500 text-lg" />
                  <span className="text-sm text-gray-600">请仔细核对以下信息，确认无误后提交</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">项目名称</p>
                    <p className="text-sm font-medium text-[#0a2a5c]">{formData.title || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">项目类别</p>
                    <p className="text-sm font-medium text-[#0a2a5c]">{formData.category || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">团队规模</p>
                    <p className="text-sm font-medium text-[#0a2a5c]">{teamSizes.find(s => s.value === formData.team_size)?.label || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">项目阶段</p>
                    <p className="text-sm font-medium text-[#0a2a5c]">{stages.find(s => s.value === formData.stage)?.label || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">联系邮箱</p>
                    <p className="text-sm font-medium text-[#0a2a5c]">{formData.contact_email || user.email || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">联系电话</p>
                    <p className="text-sm font-medium text-[#0a2a5c]">{formData.contact_phone || user.phone || '—'}</p>
                  </div>
                </div>

                {formData.tags && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#0a2a5c]/10 text-[#0a2a5c] rounded-full text-xs font-medium">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <SafetyOutlined className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">提交即表示你同意</p>
                    <p className="text-xs text-blue-700 mt-1">
                      你提交的信息将用于创业团队认证审核。审核通过后，你将获得发布项目和招募团队成员等权限。请确保所填信息真实有效。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium flex items-center"
                >
                  <ArrowLeftOutlined className="mr-2" />
                  上一步
                </button>
              )}
            </div>
            <div>
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-all font-medium flex items-center shadow-lg shadow-[#0a2a5c]/20"
                >
                  下一步
                  <ArrowRightOutlined className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white rounded-xl hover:from-[#f59e0b]/90 hover:to-[#f97316]/90 transition-all font-medium disabled:opacity-50 shadow-lg shadow-[#f59e0b]/20 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <CheckCircleOutlined className="mr-2" />
                      提交申请
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}