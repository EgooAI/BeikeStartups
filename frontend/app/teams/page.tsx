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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的团队</h1>
          <Link
            href="/teams/create"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            创建团队
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">暂无团队</p>
            <Link
              href="/teams/create"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              创建第一个团队 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{team.description}</p>
                    {team.owner && (
                      <p className="text-gray-500 text-xs">创始人：{team.owner.nickname || team.owner.username}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                    {getStatusText(team.status)}
                  </span>
                </div>

                <div className="flex space-x-3">
                  <Link
                    href={`/teams/${team.id}`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    查看详情
                  </Link>
                  
                  {team.owner_id === user?.id && (
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
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