// frontend/app/teams/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { teamApi } from '@/lib/api';
import { Team } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { message } from 'antd';
import { ArrowLeftOutlined, TeamOutlined } from '@ant-design/icons';

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const teamId = parseInt(id);

  const loadTeam = async () => {
    try {
      const response = await teamApi.get(teamId);
      if (response.data) {
        setTeam(response.data as Team);
      }
    } catch (err: unknown) {
      setError((err as Error).message || '加载团队详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      requestAnimationFrame(() => {
        loadTeam();
      });
    }
  }, [user, authLoading]);

  const handleDelete = async () => {
    if (!confirm('确定要删除这个团队吗？')) return;

    try {
      await teamApi.delete(teamId);
      router.push('/teams');
      message.success('团队已删除');
    } catch (err: unknown) {
      message.error((err as Error).message || '删除失败');
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

  if (!team) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="holo-card p-12 text-center">
          <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TeamOutlined className="text-4xl text-gray-600" />
          </div>
          <p className="text-gray-400">团队不存在</p>
        </div>
      </div>
    );
  }

  const isOwner = team.owner_id === user?.id;

  return (
    <div className="min-h-screen bg-[#050510] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeftOutlined className="mr-2" />
            返回列表
          </button>
        </div>

        <div className="holo-card p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-2">{team.name}</h1>
              <p className="text-gray-400 text-sm">
                创建于 {formatDate(team.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(team.status)}`}>
              {getStatusText(team.status)}
            </span>
          </div>

          {team.logo && (
            <div className="mb-6">
              <img src={team.logo} alt={team.name} className="w-32 h-32 object-cover rounded-2xl border border-white/[0.06]" />
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black tracking-tight text-white mb-2">团队描述</h2>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{team.description}</p>
            </div>

            {team.owner && (
              <div>
                <h2 className="text-lg font-black tracking-tight text-white mb-2">创始人</h2>
                <p className="text-gray-300">{team.owner.nickname || team.owner.username}</p>
              </div>
            )}

            {team.members && team.members.length > 0 && (
              <div>
                <h2 className="text-lg font-black tracking-tight text-white mb-2">团队成员</h2>
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                      <div className="w-9 h-9 bg-white/[0.03] border border-white/[0.06] rounded-full flex items-center justify-center">
                        <TeamOutlined className="text-gray-500" />
                      </div>
                      <div>
                        <span className="text-gray-200 font-medium">{member.nickname || member.username}</span>
                        <span className="text-gray-400 text-sm ml-2">({member.role})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="mt-8 pt-6 border-t border-white/[0.05]">
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 bg-red-500/80 text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-red-500 transition-all duration-300 font-medium"
              >
                删除团队
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
