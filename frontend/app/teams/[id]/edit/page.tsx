'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { teamApi } from '@/lib/api';
import Link from 'next/link';
import {
  TeamOutlined,
  FileTextOutlined,
  BulbOutlined,
  GlobalOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TagsOutlined,
  BuildOutlined,
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

export default function EditTeamPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const teamId = params?.id ? parseInt(params.id as string) : null;
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && teamId) {
      loadTeam();
    }
  }, [user, authLoading, teamId]);

  async function loadTeam() {
    try {
      const response = await teamApi.get(teamId!);
      if (response.data) {
        const team = response.data;
        // 解析 description 中的结构化数据
        const desc = (team as any).description || '';
        const categoryMatch = desc.match(/【项目类别】(.+)/);
        const teamSizeMatch = desc.match(/【团队规模】(.+)/);
        const stageMatch = desc.match(/【项目阶段】(.+)/);
        const marketMatch = desc.match(/【市场分析】\n([\s\S]*?)(?=\n【|$)/);
        const advantageMatch = desc.match(/【竞争优势】\n([\s\S]*?)(?=\n【|$)/);
        const teamMatch = desc.match(/【团队介绍】\n([\s\S]*?)(?=\n【|$)/);
        const emailMatch = desc.match(/邮箱：(.+)/);
        const phoneMatch = desc.match(/电话：(.+)/);
        const tagsMatch = desc.match(/标签：(.+)/);
        const descMatch = desc.match(/【项目阶段】.+\n\n([\s\S]*?)(?=\n\n【市场分析】)/);
        
        setFormData({
          name: (team as any).name || '',
          description: descMatch ? descMatch[1].trim() : '',
          category: categoryMatch ? categoryMatch[1].trim() : '',
          team_size: teamSizeMatch ? teamSizeMatch[1].trim() : '',
          stage: stageMatch ? stageMatch[1].trim() : '',
          market_analysis: marketMatch ? marketMatch[1].trim() : '',
          competitive_advantage: advantageMatch ? advantageMatch[1].trim() : '',
          team_introduction: teamMatch ? teamMatch[1].trim() : '',
          contact_email: emailMatch ? emailMatch[1].trim() : '',
          contact_phone: phoneMatch ? phoneMatch[1].trim() : '',
          tags: tagsMatch ? tagsMatch[1].trim() : '',
        });
      }
    } catch (err) {
      console.error('Failed to load team:', err);
      setError('加载团队信息失败');
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const submitData = {
        name: formData.name,
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
      };

      await teamApi.update(teamId!, submitData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '更新团队信息失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.name) { setError('请填写团队名称'); return; }
    if (step === 1 && !formData.category) { setError('请选择项目类别'); return; }
    if (step === 1 && !formData.team_size) { setError('请选择团队规模'); return; }
    if (step === 1 && !formData.stage) { setError('请选择项目阶段'); return; }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5c]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-6 text-lg">请先登录后再修改团队信息</p>
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
          <Link href="/dashboard" className="inline-flex items-center text-[#0a2a5c]/60 hover:text-[#0a2a5c] mb-4 transition-colors">
            <ArrowLeftOutlined className="mr-2" />
            返回
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] rounded-2xl flex items-center justify-center">
              <TeamOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0a2a5c]">修改团队信息</h1>
              <p className="text-gray-500 mt-1">更新你的团队信息</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-custom p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                  s <= step ? 'bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {s <= step ? <CheckCircleOutlined className="w-6 h-6" /> : s}
                </div>
                {s < totalSteps && (
                  <div className={`w-20 h-1 mx-3 rounded-full ${s < step ? 'bg-[#0a2a5c]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2">
            <span className={`font-medium ${step === 1 ? 'text-[#0a2a5c]' : 'text-gray-400'}`}>基本信息</span>
            <span className={`font-medium ${step === 2 ? 'text-[#0a2a5c]' : 'text-gray-400'}`}>项目详情</span>
            <span className={`font-medium ${step === 3 ? 'text-[#0a2a5c]' : 'text-gray-400'}`}>团队与市场</span>
            <span className={`font-medium ${step === 4 ? 'text-[#0a2a5c]' : 'text-gray-400'}`}>确认提交</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-custom p-6 mb-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BuildOutlined className="mr-2" />团队名称 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                  placeholder="请输入团队名称"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TagsOutlined className="mr-2" />项目类别 *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                  >
                    <option value="">请选择项目类别</option>
                    {projectCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TeamOutlined className="mr-2" />团队规模 *
                  </label>
                  <select
                    name="team_size"
                    value={formData.team_size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                  >
                    <option value="">请选择团队规模</option>
                    {teamSizes.map((size) => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BulbOutlined className="mr-2" />项目阶段 *
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                  >
                    <option value="">请选择项目阶段</option>
                    {stages.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileTextOutlined className="mr-2" />项目简介
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all resize-none"
                  placeholder="请简要介绍你的项目..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TagsOutlined className="mr-2" />项目标签
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                  placeholder="请输入项目标签，多个标签用逗号分隔"
                />
              </div>
            </div>
          )}

          {/* Step 3: Team & Market */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GlobalOutlined className="mr-2" />市场分析
                </label>
                <textarea
                  name="market_analysis"
                  value={formData.market_analysis}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all resize-none"
                  placeholder="请分析你的目标市场规模、用户群体、市场趋势等..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BulbOutlined className="mr-2" />竞争优势
                </label>
                <textarea
                  name="competitive_advantage"
                  value={formData.competitive_advantage}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all resize-none"
                  placeholder="请描述你的项目相比竞争对手的优势..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TeamOutlined className="mr-2" />团队介绍
                </label>
                <textarea
                  name="team_introduction"
                  value={formData.team_introduction}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all resize-none"
                  placeholder="请介绍团队成员背景、核心能力等..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirm & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-[#0a2a5c]/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#0a2a5c] mb-4">确认信息</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">团队名称</p>
                    <p className="font-medium text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">项目类别</p>
                    <p className="font-medium text-gray-900">{formData.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">团队规模</p>
                    <p className="font-medium text-gray-900">{formData.team_size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">项目阶段</p>
                    <p className="font-medium text-gray-900">{formData.stage}</p>
                  </div>
                </div>

                {formData.description && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">项目简介</p>
                    <p className="text-gray-900">{formData.description}</p>
                  </div>
                )}

                {formData.market_analysis && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">市场分析</p>
                    <p className="text-gray-900">{formData.market_analysis}</p>
                  </div>
                )}

                {formData.competitive_advantage && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">竞争优势</p>
                    <p className="text-gray-900">{formData.competitive_advantage}</p>
                  </div>
                )}

                {formData.team_introduction && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">团队介绍</p>
                    <p className="text-gray-900">{formData.team_introduction}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-4 text-sm">
                    {formData.contact_email && (
                      <span className="flex items-center text-gray-600">
                        <MailOutlined className="mr-1" />
                        {formData.contact_email}
                      </span>
                    )}
                    {formData.contact_phone && (
                      <span className="flex items-center text-gray-600">
                        <PhoneOutlined className="mr-1" />
                        {formData.contact_phone}
                      </span>
                    )}
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
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white rounded-xl hover:from-[#f59e0b]/90 hover:to-[#f97316]/90 transition-all font-medium disabled:opacity-50 shadow-lg shadow-[#f59e0b]/20 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <CheckCircleOutlined className="mr-2" />
                      保存修改
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