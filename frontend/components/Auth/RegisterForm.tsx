// frontend/components/Auth/RegisterForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword } from '@/lib/utils';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nickname: '',
    phone: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    nickname: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const validateUsername = (username: string) => {
    if (!username) return '请输入用户名';
    if (username.length < 1) return '用户名至少需要1个字符';
    if (username.length > 50) return '用户名不能超过50个字符';
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) return '用户名只能包含中文、字母、数字和下划线';
    return '';
  };

  const validateEmailField = (email: string) => {
    if (!email) return '请输入邮箱地址';
    if (!validateEmail(email)) return '请输入有效的邮箱地址';
    return '';
  };

  const validatePasswordField = (password: string) => {
    if (!password) return '请输入密码';
    if (!validatePassword(password)) return '密码长度至少为6位';
    return '';
  };

  const validateNickname = (nickname: string) => {
    if (!nickname) return '';
    if (nickname.length < 1) return '昵称至少需要1个字符';
    if (nickname.length > 50) return '昵称不能超过50个字符';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return '';
    if (!/^1[3-9]\d{9}$/.test(phone)) return '请输入有效的手机号码';
    return '';
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmailField(value);
        break;
      case 'password':
        error = validatePasswordField(value);
        break;
      case 'nickname':
        error = validateNickname(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // 实时验证当前字段
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  // 判断表单是否验证通过
  const isFormValid = () => {
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmailField(formData.email);
    const passwordError = validatePasswordField(formData.password);
    const nicknameError = validateNickname(formData.nickname);
    const phoneError = validatePhone(formData.phone);
    return !usernameError && !emailError && !passwordError && !nicknameError && !phoneError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('密码长度至少为6位');
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.nickname,
        formData.phone
      );
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            用户名 *
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={1}
            maxLength={50}
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.username ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
            value={formData.username}
            onChange={handleChange}
            placeholder="请输入用户名"
          />
          {errors.username ? (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-400">{formData.username.length}/50 字符</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            邮箱 *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="请输入邮箱地址"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            密码 *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
            value={formData.password}
            onChange={handleChange}
            placeholder="请输入密码"
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          ) : formData.password && formData.password.length < 6 ? (
            <p className="mt-1 text-sm text-amber-500">还需要输入 {6 - formData.password.length} 个字符</p>
          ) : (
            <p className="mt-1 text-sm text-gray-400">{formData.password.length} 字符</p>
          )}
        </div>

        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
            昵称
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            minLength={1}
            maxLength={50}
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.nickname ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
            value={formData.nickname}
            onChange={handleChange}
            placeholder="请输入昵称（可选）"
          />
          {errors.nickname ? (
            <p className="mt-1 text-sm text-red-500">{errors.nickname}</p>
          ) : (
            formData.nickname && <p className="mt-1 text-sm text-gray-400">{formData.nickname.length}/50 字符</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            手机号
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
            value={formData.phone}
            onChange={handleChange}
            placeholder="请输入手机号（可选）"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '注册中...' : '创建账号'}
        </button>
      </div>
    </form>
  );
}