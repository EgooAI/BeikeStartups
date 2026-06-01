'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ThunderboltOutlined,
  SmileOutlined,
} from '@ant-design/icons';

interface FormData {
  username: string;
  email: string;
  nickname: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FieldError {
  username: string;
  email: string;
  nickname: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: FormData = {
  username: '',
  email: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const EMPTY_ERRORS: FieldError = {
  username: '',
  email: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function validateForm(data: FormData): { errors: FieldError; valid: boolean } {
  const errors = { ...EMPTY_ERRORS };

  if (!data.username.trim()) {
    errors.username = '请输入用户名';
  } else if (data.username.trim().length < 2) {
    errors.username = '用户名至少需要2个字符';
  } else if (data.username.trim().length > 50) {
    errors.username = '用户名不能超过50个字符';
  }

  if (!data.email.trim()) {
    errors.email = '请输入邮箱地址';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = '请输入有效的邮箱地址';
  }

  if (data.nickname && data.nickname.length > 50) {
    errors.nickname = '昵称不能超过50个字符';
  }

  if (data.phone && !/^1[3-9]\d{9}$/.test(data.phone)) {
    errors.phone = '请输入有效的手机号码';
  }

  if (!data.password) {
    errors.password = '请输入密码';
  } else if (data.password.length < 6) {
    errors.password = '密码长度至少为6个字符';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = '请确认密码';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致';
  }

  const valid = Object.values(errors).every((e) => !e);
  return { errors, valid };
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldError>(EMPTY_ERRORS);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const updateField = (field: keyof FormData, value: string) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    if (submitted) {
      const { errors: newErrors } = validateForm(newForm);
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const { errors: newErrors, valid } = validateForm(form);
    setErrors(newErrors);
    setSubmitted(true);

    if (!valid) {
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.nickname, form.phone);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FieldError) => {
    const base = 'w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-gray-600 text-white';
    if (errors[field] && submitted) {
      return `${base} border-red-500/40 focus:ring-red-500/20 focus:border-red-500/60 bg-red-500/5`;
    }
    if (form[field] && submitted && !errors[field]) {
      return `${base} border-[#00ff88]/40 focus:ring-[#00ff88]/20 focus:border-[#00ff88]/60 bg-[#00ff88]/5`;
    }
    return `${base} bg-white/[0.03] border-white/[0.08] focus:ring-[#00f0ff]/10 focus:border-[#00f0ff]/40`;
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative cyberpunk gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00f0ff]/5 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-morph-blob" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#b347ea]/5 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-morph-blob-reverse" />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-[#ffb800]/[0.04] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float" />
      </div>

      <div className="holo-card p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00f0ff]/20 to-[#b347ea]/20 rounded-2xl mb-4 border border-[#00f0ff]/10">
            <ThunderboltOutlined className="text-3xl text-[#00f0ff]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">创建账号</h1>
          <p className="text-gray-400 mt-1">加入贝壳青创汇，开启创业之旅</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              用户名 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                placeholder="2-50个字符"
                className={inputClass('username')}
              />
            </div>
            {submitted && errors.username && (
              <p className="mt-1.5 text-xs text-red-400">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              邮箱 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MailOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="请输入邮箱地址"
                className={inputClass('email')}
              />
            </div>
            {submitted && errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                昵称
              </label>
              <div className="relative">
                <SmileOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => updateField('nickname', e.target.value)}
                  placeholder="选填"
                  className={inputClass('nickname')}
                />
              </div>
              {submitted && errors.nickname && (
                <p className="mt-1.5 text-xs text-red-400">{errors.nickname}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                手机号
              </label>
              <div className="relative">
                <PhoneOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="选填"
                  className={inputClass('phone')}
                />
              </div>
              {submitted && errors.phone && (
                <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              密码 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="至少6个字符"
                className={inputClass('password')}
              />
            </div>
            {submitted && errors.password ? (
              <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
            ) : (
              form.password && !submitted && (
                <p className="mt-1.5 text-xs text-gray-500">{form.password.length} 个字符</p>
              )
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              确认密码 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="再次输入密码"
                className={inputClass('confirmPassword')}
              />
            </div>
            {submitted && errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:from-[#00d4e0] hover:to-[#00a8e0] shadow-[0_2px_12px_rgba(0,240,255,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? '注册中...' : '创建账号'}
          </button>

          <p className="text-center text-sm text-gray-400">
            已有账号？{' '}
            <Link href="/login" className="text-[#00f0ff] hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
