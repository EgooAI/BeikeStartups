// frontend/components/Teams/TeamList.tsx
'use client';

import { useEffect, useState } from 'react';
import { teamApi } from '@/lib/api';
import { Team } from '@/types';
import TeamCard from './TeamCard';
import Loading from '@/components/Common/Loading';

export default function TeamList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

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
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  if (isLoading) {
    return <Loading size="large" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">暂无团队</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          showActions={true}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}