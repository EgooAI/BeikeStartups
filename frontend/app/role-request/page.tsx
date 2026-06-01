'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { roleApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  FundOutlined,
  ExperimentOutlined,
  BuildOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const roleOptions = [
  {
    value: 'investor',
    label: '投资人',
    icon: <FundOutlined className="text-2xl" />,
    desc: '发现高校早期创新项目，提前连接有潜力的年轻创业团队',
    color: 'from-[#b347ea] to-[#7c3aed]',
    neon: '#b347ea',
    fields: ['organization', 'investment_focus'],
  },
  {
    value: 'mentor',
    label: '校外导师',
    icon: <ExperimentOutlined className="text-2xl" />,
    desc: '用行业经验帮助学生创业团队完善商业模式与产品路径',
    color: 'from-[#00ff88] to-[#00cc6a]',
    neon: '#00ff88',
    fields: ['organization', 'expertise'],
  },
  {
    value: 'partner',
    label: '资源方',
    icon: <BuildOutlined className="text-2xl" />,
    desc: '提供产业资源、试点场景、服务能力，与校园创新项目合作',
    color: 'from-[#00f0ff] to-[#00b8d4]',
    neon: '#00f0ff',
    fields: ['organization', 'service_area'],
  },
];

export default function RoleRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
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
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">请先登录</p>
          <Link href="/login" className="text-[#00f0ff] hover:underline">去登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">身份认证申请</h1>
        <p className="text-gray-400 mb-8">选择你想要申请的身份，填写相关信息提交审核。</p>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {roleOptions.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`p-6 rounded-xl border text-left transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                selectedRole === role.value
                  ? 'border-[#00f0ff]/50 bg-white/[0.03] shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                  : 'border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12]'
              }`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} text-white mb-3 shadow-sm`}>
                {role.icon}
              </div>
              <h3 className="font-black tracking-tight text-white mb-1">{role.label}</h3>
              <p className="text-sm text-gray-400">{role.desc}</p>
            </button>
          ))}
        </div>

        {selectedRole && (
          <form onSubmit={handleSubmit} className="holo-card p-8 space-y-6">
            <h2 className="text-xl font-black tracking-tight text-white">
              申请成为 {roleOptions.find(r => r.value === selectedRole)?.label}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">所属机构/单位</label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                placeholder="请填写您的所属机构"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 placeholder:text-gray-600 text-white"
              />
            </div>

            {selectedRole === 'mentor' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">专业领域/擅长方向</label>
                <textarea
                  value={form.expertise}
                  onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                  placeholder="请描述您的专业领域和擅长方向"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 placeholder:text-gray-600 text-white resize-none"
                />
              </div>
            )}

            {selectedRole === 'investor' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">投资方向</label>
                <textarea
                  value={form.investment_focus}
                  onChange={(e) => setForm({ ...form, investment_focus: e.target.value })}
                  placeholder="请描述您的投资方向和关注的领域"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 placeholder:text-gray-600 text-white resize-none"
                />
              </div>
            )}

            {selectedRole === 'partner' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">服务领域/资源类型</label>
                <textarea
                  value={form.service_area}
                  onChange={(e) => setForm({ ...form, service_area: e.target.value })}
                  placeholder="请描述您能提供的资源类型和服务领域"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 placeholder:text-gray-600 text-white resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">申请说明</label>
              <textarea
                value={form.application_note}
                onChange={(e) => setForm({ ...form, application_note: e.target.value })}
                placeholder="请补充说明您的申请理由"
                rows={3}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 placeholder:text-gray-600 text-white resize-none"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm ${
                message.includes('成功')
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl shadow-sm hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? '提交中...' : '提交申请'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
