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
    color: 'from-purple-500 to-purple-700',
    fields: ['organization', 'investment_focus'],
  },
  {
    value: 'mentor',
    label: '校外导师',
    icon: <ExperimentOutlined className="text-2xl" />,
    desc: '用行业经验帮助学生创业团队完善商业模式与产品路径',
    color: 'from-green-500 to-green-700',
    fields: ['organization', 'expertise'],
  },
  {
    value: 'partner',
    label: '资源方',
    icon: <BuildOutlined className="text-2xl" />,
    desc: '提供产业资源、试点场景、服务能力，与校园创新项目合作',
    color: 'from-teal-500 to-teal-700',
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">请先登录</p>
          <Link href="/login" className="text-[#0a2a5c] hover:underline">去登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[#0a2a5c] mb-2">身份认证申请</h1>
        <p className="text-gray-500 mb-8">选择你想要申请的身份，填写相关信息提交审核。</p>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {roleOptions.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`p-6 rounded-xl border-2 text-left transition-all ${selectedRole === role.value
                  ? 'border-[#0a2a5c] bg-white shadow-custom'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} text-white mb-3`}>
                {role.icon}
              </div>
              <h3 className="font-semibold text-[#0a2a5c] mb-1">{role.label}</h3>
              <p className="text-sm text-gray-500">{role.desc}</p>
            </button>
          ))}
        </div>

        {selectedRole && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-custom p-8 space-y-6">
            <h2 className="text-xl font-semibold text-[#0a2a5c]">
              申请成为 {roleOptions.find(r => r.value === selectedRole)?.label}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属机构/单位</label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                placeholder="请填写您的所属机构"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>

            {selectedRole === 'mentor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">专业领域/擅长方向</label>
                <textarea
                  value={form.expertise}
                  onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                  placeholder="请描述您的专业领域和擅长方向"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                />
              </div>
            )}

            {selectedRole === 'investor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">投资方向</label>
                <textarea
                  value={form.investment_focus}
                  onChange={(e) => setForm({ ...form, investment_focus: e.target.value })}
                  placeholder="请描述您的投资方向和关注的领域"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                />
              </div>
            )}

            {selectedRole === 'partner' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">服务领域/资源类型</label>
                <textarea
                  value={form.service_area}
                  onChange={(e) => setForm({ ...form, service_area: e.target.value })}
                  placeholder="请描述您能提供的资源类型和服务领域"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">申请说明</label>
              <textarea
                value={form.application_note}
                onChange={(e) => setForm({ ...form, application_note: e.target.value })}
                placeholder="请补充说明您的申请理由"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? '提交中...' : '提交申请'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}