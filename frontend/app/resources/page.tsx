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
  CloseOutlined,
} from '@ant-design/icons';

const roleOptions = [
  {
    id: 'investor',
    title: '投资人',
    icon: <FundOutlined className="text-2xl" />,
    color: 'from-[#b347ea] to-[#9c27e0]',
    neonColor: '#b347ea',
    desc: '发现高校早期创新项目，提前连接有潜力的年轻创业团队',
    fields: ['organization', 'investment_focus'],
    label: '申请投资人认证',
  },
  {
    id: 'mentor',
    title: '校外导师',
    icon: <ExperimentOutlined className="text-2xl" />,
    color: 'from-[#00ff88] to-[#00cc6a]',
    neonColor: '#00ff88',
    desc: '用行业经验帮助学生创业团队完善商业模式与产品路径',
    fields: ['organization', 'expertise'],
    label: '成为创业导师',
  },
  {
    id: 'partner',
    title: '资源方',
    icon: <BuildOutlined className="text-2xl" />,
    color: 'from-[#00f0ff] to-[#00b8d4]',
    neonColor: '#00f0ff',
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
  const [msg, setMsg] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    fetchResources();
  }, []);

  // 弹窗打开时锁定页面滚动
  useEffect(() => {
    if (selectedRole && !isAdmin) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedRole, isAdmin]);

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
    setMsg('');
    try {
      await roleApi.request({
        requested_role: selectedRole,
        ...form,
      });
      setMsg('申请已提交，请等待管理员审核。');
      setForm({
        organization: '',
        expertise: '',
        investment_focus: '',
        service_area: '',
        application_note: '',
      });
    } catch (err: any) {
      setMsg(err.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 未登录显示登录提示
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BuildOutlined className="text-4xl text-gray-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-3">登录后查看创投资源</h2>
          <p className="text-gray-400 mb-8">
            登录后即可浏览投资人、导师和资源方专区，申请相关身份认证。
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-300"
          >
            立即登录
            <ArrowRightOutlined className="ml-2" />
          </a>
          <p className="mt-6 text-sm text-gray-500">
            还没有账号？{' '}
            <a href="/register" className="text-[#ffb800] hover:text-[#ffc800] hover:underline font-medium transition-colors">
              立即注册
            </a>
          </p>
        </div>
      </div>
    );
  }

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
      office: 'bg-[#00f0ff]/10 text-[#00f0ff]',
      tech: 'bg-[#b347ea]/10 text-[#b347ea]',
      supply: 'bg-[#ffb800]/10 text-[#ffb800]',
      media: 'bg-pink-500/10 text-pink-400',
      legal: 'bg-[#00ff88]/10 text-[#00ff88]',
      capital: 'bg-orange-500/10 text-orange-400',
      channel: 'bg-cyan-500/10 text-cyan-400',
      other: 'bg-gray-500/10 text-gray-400',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-400';
  };

  // 非学生且非管理员显示权限不足提示
  if (user.role !== 'student' && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BuildOutlined className="text-4xl text-gray-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-3">权限不足</h2>
          <p className="text-gray-400 mb-8">
            创投资源功能仅对学生开放。若您需要申请投资人、导师或资源方身份，请先注册学生账号。
          </p>
          <a
            href="/"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-300"
          >
            返回首页
            <ArrowRightOutlined className="ml-2" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="bg-gradient-to-br from-[#0a0a1a] via-[#050510] to-[#0a0a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">连接校内项目与校外资源</h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            贝壳创业俱乐部欢迎投资机构、创业导师、产业资源方、校友企业和孵化平台共同参与校园创新生态建设。
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 管理员提示 */}
        {isAdmin && (
          <div className="bg-[#ffb800]/5 border border-[#ffb800]/20 rounded-xl p-5 mb-8 text-center">
            <p className="text-[#ffb800] text-sm font-medium">
              您当前为管理员身份，可以浏览创投资源页面，但不能提交身份申请。
            </p>
          </div>
        )}

        {/* 身份选择区域 */}
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-tight text-white mb-6 text-center">选择您的身份</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleOptions.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                  selectedRole === role.id
                    ? 'border-[#00f0ff]/50 bg-white/[0.04] shadow-[0_0_25px_rgba(0,240,255,0.08)]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-[#00f0ff]/20 hover:bg-white/[0.03]'
                }`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#00c8ff] text-[#050510] mb-3 shadow-sm">
                  {role.icon}
                </div>
                <h3 className="font-black tracking-tight text-white mb-1">{role.title}</h3>
                <p className="text-sm text-gray-400">{role.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 平台合作资源展示 */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight text-white mb-2">平台合作资源</h2>
            <p className="text-gray-500">以下为平台已入驻的合作资源方，覆盖办公空间、技术服务、资金支持等多个领域</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
                <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
              </div>
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((res: any) => (
                <div key={res.id} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-[#00f0ff]/20 hover:shadow-[0_0_25px_rgba(0,240,255,0.05)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${getResourceTypeColor(res.resource_type)}`}>
                      {getResourceTypeLabel(res.resource_type)}
                    </span>
                  </div>
                  <h3 className="font-black tracking-tight text-white mb-2">{res.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4">{res.description}</p>
                  {res.tags && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {res.tags.split(',').map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-white/[0.04] text-gray-400 rounded-lg text-xs border border-white/[0.06]">{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-white/[0.05] pt-3 flex items-center text-xs text-gray-500">
                    <span>{res.contact}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/[0.02] backdrop-blur-sm border border-dashed border-white/[0.08] rounded-2xl">
              <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BuildOutlined className="text-2xl text-gray-500" />
              </div>
              <p className="text-gray-500 text-sm">暂无合作资源信息</p>
            </div>
          )}
        </div>

        {/* 申请表单弹窗 — 管理员不可申请 */}
        {!isAdmin && selectedRole && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedRole(''); setMsg(''); } }}>
            <div className="bg-[#0a0a1a] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
              {/* 弹窗头部 */}
              <div className="sticky top-0 bg-[#0a0a1a] border-b border-white/[0.08] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-lg font-black tracking-tight text-white">
                  申请成为 {roleOptions.find(r => r.id === selectedRole)?.title}
                </h2>
                <button
                  onClick={() => { setSelectedRole(''); setMsg(''); }}
                  className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <CloseOutlined />
                </button>
              </div>

              {/* 弹窗内容 */}
              <div className="p-6">
                <form onSubmit={async (e) => { await handleSubmit(e); }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">所属机构/单位</label>
                    <input
                      type="text"
                      required
                      value={form.organization}
                      onChange={(e) => setForm({ ...form, organization: e.target.value })}
                      placeholder="请填写您的所属机构"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/10 focus:border-[#00f0ff]/40 transition-all placeholder:text-gray-500 text-white"
                    />
                  </div>

                  {selectedRole === 'mentor' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">专业领域/擅长方向</label>
                      <textarea
                        value={form.expertise}
                        onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                        placeholder="请描述您的专业领域和擅长方向"
                        rows={3}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/10 focus:border-[#00f0ff]/40 transition-all placeholder:text-gray-500 resize-none text-white"
                      />
                    </div>
                  )}

                  {selectedRole === 'investor' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">投资方向</label>
                      <textarea
                        value={form.investment_focus}
                        onChange={(e) => setForm({ ...form, investment_focus: e.target.value })}
                        placeholder="请描述您的投资方向和关注的领域"
                        rows={3}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/10 focus:border-[#00f0ff]/40 transition-all placeholder:text-gray-500 resize-none text-white"
                      />
                    </div>
                  )}

                  {selectedRole === 'partner' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">服务领域/资源类型</label>
                      <textarea
                        value={form.service_area}
                        onChange={(e) => setForm({ ...form, service_area: e.target.value })}
                        placeholder="请描述您能提供的资源类型和服务领域"
                        rows={3}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/10 focus:border-[#00f0ff]/40 transition-all placeholder:text-gray-500 resize-none text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">申请说明</label>
                    <textarea
                      value={form.application_note}
                      onChange={(e) => setForm({ ...form, application_note: e.target.value })}
                      placeholder="请补充说明您的申请理由"
                      rows={3}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/10 focus:border-[#00f0ff]/40 transition-all placeholder:text-gray-500 resize-none text-white"
                    />
                  </div>

                  {msg && (
                    <div className={`p-4 rounded-xl text-sm flex items-center ${
                      msg.includes('已提交') || msg.includes('成功') ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {msg.includes('已提交') || msg.includes('成功') ? <CheckCircleOutlined className="mr-2" /> : null}
                      {msg}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] rounded-xl font-bold hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-300 disabled:opacity-50"
                    >
                      {submitting ? '提交中...' : '提交申请'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedRole(''); setMsg(''); }}
                      className="px-6 py-3 bg-transparent border border-white/10 text-gray-400 rounded-xl hover:border-[#00f0ff]/40 hover:text-white hover:scale-105 transition-all duration-300 font-medium"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
