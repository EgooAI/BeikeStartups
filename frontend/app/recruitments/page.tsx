'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { recruitmentApi } from '@/lib/api';
import { Recruitment } from '@/types';
import {
  TeamOutlined,
  PlusCircleOutlined,
  LoginOutlined,
} from '@ant-design/icons';

export default function RecruitmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchRecruitments();
    }
  }, [authLoading, user]);

  async function fetchRecruitments() {
    try {
      // 团队负责人只看自己发布的招募，其他人看全部
      const isOwner = user?.role === 'team_owner';
      const res = await recruitmentApi.list('active', isOwner);
      if (res.data) {
        const data = res.data as { items?: Recruitment[] };
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#f7f3ec] to-[#faf7f2]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-accent/30 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">正在加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50">
      <div className="bg-gradient-to-br from-[#fefcf8] via-[#faf7f2] to-[#f5f0e8] border-b border-[#e8dfd0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-primary mb-2">创业团队招募广场</h1>
              <p className="text-gray-500">汇聚正在招募成员的校内创业团队，找到适合你的创业机会。</p>
            </div>
            {user?.role === 'team_owner' && (
              <Link
                href="/recruitments/create"
                className="inline-flex items-center px-5 py-2.5 bg-primary text-white font-medium rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <PlusCircleOutlined className="mr-2" />
                发布招募
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 未登录提示条 */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-amber-700 text-sm">
              您当前为游客身份，可以浏览所有招募信息。登录后即可提交申请，加入心仪的创业团队。
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors flex-shrink-0 ml-4"
            >
              <LoginOutlined className="mr-1.5" />
              立即登录
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-accent/30 animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>
          </div>
        ) : recruitments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recruitments.map((rec) => (
              <Link
                key={rec.id}
                href={`/recruitments/${rec.id}`}
                className="dashboard-panel p-6 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-primary group-hover:text-accent transition-colors">
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
                  <span className="px-3 py-1 bg-accent-light text-accent rounded-lg text-xs font-medium">
                    {rec.position}
                  </span>
                  {rec.salary && (
                    <span className="px-3 py-1 bg-[#f5f0e8] text-gray-500 rounded-lg text-xs">
                      {rec.salary}
                    </span>
                  )}
                  {rec.deadline && (
                    <span className="px-3 py-1 bg-[#f5f0e8] text-gray-500 rounded-lg text-xs">
                      截止: {new Date(rec.deadline).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                </div>
                {rec.requirements && (
                  <p className="text-xs text-gray-400 border-t border-[#e8dfd0]/60 pt-3">
                    要求: {rec.requirements}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TeamOutlined className="text-4xl text-primary/40" />
            </div>
            <p className="text-gray-400 text-lg">暂无招募信息</p>
            <p className="text-gray-400 text-sm mt-2">还没有团队发布招募，敬请期待</p>
          </div>
        )}
      </div>
    </div>
  );
}
