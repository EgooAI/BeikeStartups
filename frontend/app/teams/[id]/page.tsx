// frontend/app/teams/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { teamApi } from '@/lib/api';
import { Team } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { message } from 'antd';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">团队不存在</p>
      </div>
    );
  }

  const isOwner = team.owner_id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-700 mb-4"
          >
            ← 返回列表
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.name}</h1>
              <p className="text-gray-500 text-sm">
                创建于 {formatDate(team.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(team.status)}`}>
              {getStatusText(team.status)}
            </span>
          </div>

          {team.logo && (
            <div className="mb-6">
              <img src={team.logo} alt={team.name} className="w-32 h-32 object-cover rounded-lg" />
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">团队描述</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{team.description}</p>
            </div>

            {team.owner && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">创始人</h2>
                <p className="text-gray-700">{team.owner.nickname || team.owner.username}</p>
              </div>
            )}

            {team.members && team.members.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">团队成员</h2>
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <span className="text-gray-700">{member.nickname || member.username}</span>
                      <span className="text-gray-500 text-sm">({member.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="mt-8">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
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