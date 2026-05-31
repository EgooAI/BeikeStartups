// frontend/components/Auth/RegisterForm.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    nickname: false,
    phone: false,
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  // 判断字段是否显示错误（已触摸且有错误）
  const showError = (field: keyof typeof errors) => {
    return touched[field] && errors[field];
  };

  // 判断字段是否显示成功状态（已触摸且无错误且有值）
  const showSuccess = (field: keyof typeof errors, value: string, required: boolean = false) => {
    if (!touched[field]) return false;
    if (errors[field]) return false;
    if (required && !value) return false;
    if (!required && !value) return false;
    return true;
  };

  // 使用 useMemo 确保 isFormValid 正确依赖 formData
  const isFormValid = useMemo(() => {
    // 必填字段必须有值
    if (!formData.username || !formData.email || !formData.password) {
      return false;
    }

    // 检查用户名长度（至少1个字符）
    if (formData.username.length < 1) return false;
    if (formData.username.length > 50) return false;

    // 检查邮箱格式
    if (!validateEmail(formData.email)) return false;

    // 检查密码长度（至少6个字符）
    if (formData.password.length < 6) return false;

    // 检查昵称（可选，如果填写了要验证）
    if (formData.nickname && (formData.nickname.length < 1 || formData.nickname.length > 50)) return false;

    // 检查手机号（可选，如果填写了要验证）
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) return false;

    return true;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证用户名
    const usernameErr = validateUsername(formData.username);
    const emailErr = validateEmailField(formData.email);
    const passwordErr = validatePasswordField(formData.password);
    const nicknameErr = validateNickname(formData.nickname);
    const phoneErr = validatePhone(formData.phone);

    const newErrors = {
      username: usernameErr,
      email: emailErr,
      password: passwordErr,
      nickname: nicknameErr,
      phone: phoneErr,
    };

    // 设置所有字段为已触摸状态
    setTouched({
      username: true,
      email: true,
      password: true,
      nickname: true,
      phone: true,
    });

    // 设置所有错误
    setErrors(newErrors);

    // 如果有任何错误，显示第一个错误
    if (usernameErr) {
      setError(usernameErr);
      return;
    }
    if (emailErr) {
      setError(emailErr);
      return;
    }
    if (passwordErr) {
      setError(passwordErr);
      return;
    }
    if (nicknameErr) {
      setError(nicknameErr);
      return;
    }
    if (phoneErr) {
      setError(phoneErr);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '注册失败';
      setError(errorMessage);
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
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${showError('username')
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : showSuccess('username', formData.username, true)
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="请输入用户名"
          />
          {showError('username') ? (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-1">✕</span> {errors.username}
            </p>
          ) : showSuccess('username', formData.username, true) ? (
            <p className="mt-1 text-sm text-green-500 flex items-center">
              <span className="mr-1">✓</span> 用户名可用
            </p>
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
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${showError('email')
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : showSuccess('email', formData.email, true)
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="请输入邮箱地址"
          />
          {showError('email') ? (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-1">✕</span> {errors.email}
            </p>
          ) : showSuccess('email', formData.email, true) ? (
            <p className="mt-1 text-sm text-green-500 flex items-center">
              <span className="mr-1">✓</span> 邮箱格式正确
            </p>
          ) : null}
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
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${showError('password')
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : showSuccess('password', formData.password, true)
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : formData.password && formData.password.length < 6
                    ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="请输入密码"
          />
          {showError('password') ? (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-1">✕</span> {errors.password}
            </p>
          ) : showSuccess('password', formData.password, true) ? (
            <p className="mt-1 text-sm text-green-500 flex items-center">
              <span className="mr-1">✓</span> 密码格式正确
            </p>
          ) : formData.password && formData.password.length < 6 ? (
            <p className="mt-1 text-sm text-amber-500 flex items-center">
              <span className="mr-1">!</span> 还需要输入 {6 - formData.password.length} 个字符
            </p>
          ) : !formData.password ? (
            <p className="mt-1 text-sm text-gray-400">至少6位字符</p>
          ) : (
            <p className="mt-1 text-sm text-gray-400">{formData.password.length} 字符（至少6位）</p>
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
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${showError('nickname')
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : showSuccess('nickname', formData.nickname, false)
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            value={formData.nickname}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="请输入昵称（可选）"
          />
          {showError('nickname') ? (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-1">✕</span> {errors.nickname}
            </p>
          ) : showSuccess('nickname', formData.nickname, false) ? (
            <p className="mt-1 text-sm text-green-500 flex items-center">
              <span className="mr-1">✓</span> 昵称格式正确
            </p>
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
            className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${showError('phone')
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : showSuccess('phone', formData.phone, false)
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="请输入手机号（可选）"
          />
          {showError('phone') ? (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-1">✕</span> {errors.phone}
            </p>
          ) : showSuccess('phone', formData.phone, false) ? (
            <p className="mt-1 text-sm text-green-500 flex items-center">
              <span className="mr-1">✓</span> 手机号格式正确
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '注册中...' : '创建账号'}
        </button>
      </div>
    </form>
  );
}