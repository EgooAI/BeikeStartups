'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { recruitmentApi } from '@/lib/api';
import { Recruitment } from '@/types';
import {
  TeamOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  LoginOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

export default function RecruitmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecruitments();
    }
  }, [user]);

  async function fetchRecruitments() {
    try {
      let res;
      // 学生查看所有招募，项目负责人查看自己发布的招募
      if (user?.role === 'student') {
        res = await recruitmentApi.list('active');
      } else if (user?.role === 'team_owner') {
        res = await recruitmentApi.list('active', true);
      }
      if (res && res.data) {
        const data = res.data as any;
        setRecruitments(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch recruitments:', err);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  const isAllowedRole = user?.role === 'student' || user?.role === 'team_owner';
  
  if (!user || !isAllowedRole) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-custom-lg p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-[#0a2a5c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserOutlined className="text-4xl text-[#0a2a5c]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0a2a5c] mb-3">
            {!user ? '登录后查看招募广场' : '权限不足'}
          </h2>
          <p className="text-gray-500 mb-8">
            {!user 
              ? '登录后即可浏览创业团队的招募信息，找到适合你的创业机会。' 
              : '只有学生和项目负责人可以访问招募广场'}
          </p>
          {!user ? (
            <>
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-3 bg-[#0a2a5c] text-white font-semibold rounded-xl hover:bg-[#0a2a5c]/90 transition-colors"
              >
                <LoginOutlined className="mr-2" />
                立即登录
              </Link>
              <p className="text-sm text-gray-400 mt-4">
                还没有账号？{' '}
                <Link href="/register" className="text-[#f59e0b] hover:underline">
                  立即注册
                </Link>
              </p>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-3 bg-[#0a2a5c] text-white font-semibold rounded-xl hover:bg-[#0a2a5c]/90 transition-colors"
            >
              返回首页
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2a5c] mb-2">创业团队招募广场</h1>
              <p className="text-gray-500">汇聚正在招募成员的校内创业团队，找到适合你的创业机会。</p>
            </div>
            {user?.role === 'team_owner' && (
              <Link
                href="/recruitments/create"
                className="inline-flex items-center px-5 py-2.5 bg-[#0a2a5c] text-white font-medium rounded-xl hover:bg-[#0a2a5c]/90 transition-colors"
              >
                <PlusCircleOutlined className="mr-2" />
                发布招募
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
          </div>
        ) : recruitments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recruitments.map((rec) => (
              <Link
                key={rec.id}
                href={`/recruitments/${rec.id}`}
                className="bg-white rounded-xl shadow-custom hover:shadow-custom-lg transition-all p-6 border border-gray-100 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#0a2a5c] group-hover:text-[#f59e0b] transition-colors">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{rec.team?.name || '创业团队'}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium whitespace-nowrap">
                    招募中
                  </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{rec.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#f59e0b]/10 text-[#f59e0b] rounded-lg text-xs font-medium">
                    {rec.position}
                  </span>
                  {rec.salary && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                      {rec.salary}
                    </span>
                  )}
                  {rec.deadline && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                      截止: {new Date(rec.deadline).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                </div>
                {rec.requirements && (
                  <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                    要求: {rec.requirements}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <TeamOutlined className="text-6xl mb-4 block" />
            <p className="text-lg">暂无招募信息</p>
            <p className="text-sm mt-2">还没有团队发布招募，敬请期待</p>
          </div>
        )}
      </div>
    </div>
  );
}