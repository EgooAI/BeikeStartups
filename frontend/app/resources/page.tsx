'use client';

import { useEffect, useState } from 'react';
import { resourceApi, roleApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  FundOutlined,
  ExperimentOutlined,
  BuildOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const roleOptions = [
  {
    id: 'investor',
    title: '投资人',
    icon: <FundOutlined className="text-2xl" />,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    desc: '发现高校早期创新项目，提前连接有潜力的年轻创业团队',
    fields: ['organization', 'investment_focus'],
    label: '申请投资人认证',
  },
  {
    id: 'mentor',
    title: '校外导师',
    icon: <ExperimentOutlined className="text-2xl" />,
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    desc: '用行业经验帮助学生创业团队完善商业模式与产品路径',
    fields: ['organization', 'expertise'],
    label: '成为创业导师',
  },
  {
    id: 'partner',
    title: '资源方',
    icon: <BuildOutlined className="text-2xl" />,
    color: 'from-teal-500 to-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    desc: '提供产业资源、试点场景、服务能力，与校园创新项目合作',
    fields: ['organization', 'service_area'],
    label: '发布资源合作',
  },
];

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({
    organization: '',
    expertise: '',
    investment_focus: '',
    service_area: '',
    application_note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      const res = await resourceApi.list();
      if (res.data) {
        const data = res.data as any;
        setResources(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSubmitting(true);
    setMessage('');
    try {
      await roleApi.request({
        requested_role: selectedRole,
        ...form,
      });
      setMessage('申请已提交，请等待管理员审核。');
      setForm({
        organization: '',
        expertise: '',
        investment_focus: '',
        service_area: '',
        application_note: '',
      });
    } catch (err: any) {
      setMessage(err.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 未登录显示登录提示
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f3ec]/50 flex items-center justify-center">
        <div className="bg-[#fefcf8] rounded-2xl border border-[#e8dfd0] shadow-sm p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BuildOutlined className="text-4xl text-[#0a2a5c]/40" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c] mb-3">登录后查看创投资源</h2>
          <p className="text-[#0a2a5c]/60 mb-8">
            登录后即可浏览投资人、导师和资源方专区，申请相关身份认证。
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#0a2a5c] to-[#1a4a8a] text-white font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            立即登录
            <ArrowRightOutlined className="ml-2" />
          </a>
          <p className="mt-6 text-sm text-[#0a2a5c]/50">
            还没有账号？{' '}
            <a href="/register" className="text-[#f59e0b] hover:text-[#d97706] hover:underline font-medium transition-colors">
              立即注册
            </a>
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  const getResourceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      office: '办公空间',
      tech: '技术服务',
      supply: '供应链',
      media: '媒体曝光',
      legal: '法律财税',
      capital: '资金支持',
      channel: '渠道合作',
      other: '其他',
    };
    return types[type] || type;
  };

  const getResourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      office: 'bg-blue-100 text-blue-700',
      tech: 'bg-purple-100 text-purple-700',
      supply: 'bg-amber-100 text-amber-700',
      media: 'bg-pink-100 text-pink-700',
      legal: 'bg-emerald-100 text-emerald-700',
      capital: 'bg-orange-100 text-orange-700',
      channel: 'bg-cyan-100 text-cyan-700',
      other: 'bg-gray-100 text-gray-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  // 非学生且非管理员显示权限不足提示
  if (user.role !== 'student' && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f3ec]/50 flex items-center justify-center">
        <div className="bg-[#fefcf8] rounded-2xl border border-[#e8dfd0] shadow-sm p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BuildOutlined className="text-4xl text-[#0a2a5c]/20" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c] mb-3">权限不足</h2>
          <p className="text-[#0a2a5c]/60 mb-8">
            创投资源功能仅对学生开放。若您需要申请投资人、导师或资源方身份，请先注册学生账号。
          </p>
          <a
            href="/"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#0a2a5c] to-[#1a4a8a] text-white font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            返回首页
            <ArrowRightOutlined className="ml-2" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50">
      <div className="bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">连接校内项目与校外资源</h1>
          <p className="text-lg text-white/70 max-w-3xl">
            贝壳创业俱乐部欢迎投资机构、创业导师、产业资源方、校友企业和孵化平台共同参与校园创新生态建设。
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 管理员提示 */}
        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-center">
            <p className="text-amber-700 text-sm font-medium">
              您当前为管理员身份，可以浏览创投资源页面，但不能提交身份申请。
            </p>
          </div>
        )}

        {/* 身份选择区域 */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c] mb-6 text-center">选择您的身份</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleOptions.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                  selectedRole === role.id
                    ? 'border-[#0a2a5c] bg-[#fefcf8] shadow-md'
                    : 'border-[#e8dfd0] bg-[#fefcf8] hover:border-[#0a2a5c]/20 hover:shadow-sm'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} text-white mb-3 shadow-sm`}>
                  {role.icon}
                </div>
                <h3 className="font-extrabold tracking-tight text-[#0a2a5c] mb-1">{role.title}</h3>
                <p className="text-sm text-[#0a2a5c]/50">{role.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
              平台合作资源展示
            ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c] mb-2">平台合作资源</h2>
            <p className="text-[#8b7e6a]">以下为平台已入驻的合作资源方，覆盖办公空间、技术服务、资金支持等多个领域</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-accent/30 animate-spin" style={{ animationDuration: '1.5s' }} />
              </div>
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((res: any) => (
                <div key={res.id} className="bg-[#fefcf8] rounded-2xl border border-[#e8dfd0] shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${getResourceTypeColor(res.resource_type)}`}>
                      {getResourceTypeLabel(res.resource_type)}
                    </span>
                  </div>
                  <h3 className="font-extrabold tracking-tight text-[#0a2a5c] mb-2">{res.title}</h3>
                  <p className="text-sm text-[#8b7e6a] leading-relaxed line-clamp-2 mb-4">{res.description}</p>
                  {res.tags && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {res.tags.split(',').map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-[#f5f0e8] text-[#8b7e6a] rounded-lg text-xs">{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-[#f0e8db] pt-3 flex items-center text-xs text-[#a89a80]">
                    <span>📞 {res.contact}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#fefcf8] rounded-2xl border border-dashed border-[#d9cebb]">
              <div className="w-16 h-16 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BuildOutlined className="text-2xl text-[#a89a80]" />
              </div>
              <p className="text-[#a89a80] text-sm">暂无合作资源信息</p>
            </div>
          )}
        </div>

        {/* 申请表单 — 管理员不可申请 */}
        {!isAdmin && selectedRole && (
          <div className="bg-[#fefcf8] rounded-2xl border border-[#e8dfd0] shadow-sm p-8 mb-12">
            <h2 className="text-xl font-extrabold tracking-tight text-[#0a2a5c] mb-6">
              申请成为 {roleOptions.find(r => r.id === selectedRole)?.title}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0a2a5c]/70 mb-2">所属机构/单位</label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="请填写您的所属机构"
                  className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 focus:border-[#f59e0b] transition-all placeholder:text-[#0a2a5c]/30"
                />
              </div>

              {selectedRole === 'mentor' && (
                <div>
                  <label className="block text-sm font-medium text-[#0a2a5c]/70 mb-2">专业领域/擅长方向</label>
                  <textarea
                    value={form.expertise}
                    onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                    placeholder="请描述您的专业领域和擅长方向"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 focus:border-[#f59e0b] transition-all placeholder:text-[#0a2a5c]/30 resize-none"
                  />
                </div>
              )}

              {selectedRole === 'investor' && (
                <div>
                  <label className="block text-sm font-medium text-[#0a2a5c]/70 mb-2">投资方向</label>
                  <textarea
                    value={form.investment_focus}
                    onChange={(e) => setForm({ ...form, investment_focus: e.target.value })}
                    placeholder="请描述您的投资方向和关注的领域"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 focus:border-[#f59e0b] transition-all placeholder:text-[#0a2a5c]/30 resize-none"
                  />
                </div>
              )}

              {selectedRole === 'partner' && (
                <div>
                  <label className="block text-sm font-medium text-[#0a2a5c]/70 mb-2">服务领域/资源类型</label>
                  <textarea
                    value={form.service_area}
                    onChange={(e) => setForm({ ...form, service_area: e.target.value })}
                    placeholder="请描述您能提供的资源类型和服务领域"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 focus:border-[#f59e0b] transition-all placeholder:text-[#0a2a5c]/30 resize-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#0a2a5c]/70 mb-2">申请说明</label>
                <textarea
                  value={form.application_note}
                  onChange={(e) => setForm({ ...form, application_note: e.target.value })}
                  placeholder="请补充说明您的申请理由"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 focus:border-[#f59e0b] transition-all placeholder:text-[#0a2a5c]/30 resize-none"
                />
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-sm flex items-center ${
                  message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.includes('成功') && <CheckCircleOutlined className="mr-2" />}
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#0a2a5c] to-[#1a4a8a] text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交申请'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
