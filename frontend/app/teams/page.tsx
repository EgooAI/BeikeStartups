// frontend/app/teams/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { teamApi } from '@/lib/api';
import { Team } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { message } from 'antd';
import Link from 'next/link';
import { TeamOutlined, PlusOutlined } from '@ant-design/icons';

export default function TeamsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadTeams();
    }
  }, [user, authLoading]);

  const loadTeams = async () => {
    try {
      const response = await teamApi.list();
      if (response.data) {
        setTeams(response.data as Team[]);
      }
    } catch (err: any) {
      setError(err.message || '加载团队列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个团队吗？')) return;

    try {
      await teamApi.delete(id);
      loadTeams();
      message.success('团队已删除');
    } catch (err: any) {
      message.error(err.message || '删除失败');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050510]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
        <p className="text-gray-500 text-sm animate-pulse">正在加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="bg-[#050510] border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">我的团队</h1>
              <p className="text-gray-400 mt-1">管理你创建或加入的创业团队</p>
            </div>
            <Link
              href="/teams/create"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <PlusOutlined className="mr-2" />
              创建团队
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {teams.length === 0 ? (
          <div className="holo-card p-12 text-center">
            <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TeamOutlined className="text-4xl text-gray-600" />
            </div>
            <p className="text-gray-400 mb-4 text-lg">暂无团队</p>
            <Link
              href="/teams/create"
              className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <PlusOutlined className="mr-2" />
              创建第一个团队
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="holo-card p-6 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-2 truncate">{team.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{team.description}</p>
                    {team.owner && (
                      <p className="text-gray-500 text-xs">创始人：{team.owner.nickname || team.owner.username}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-3 ${getStatusColor(team.status)}`}>
                    {getStatusText(team.status)}
                  </span>
                </div>

                <div className="flex items-center space-x-4 pt-3 border-t border-white/[0.05]">
                  <Link
                    href={`/teams/${team.id}`}
                    className="text-[#00f0ff] hover:text-[#00d4ff] font-medium text-sm transition-colors"
                  >
                    查看详情
                  </Link>

                  {team.owner_id === user?.id && (
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
