'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RightOutlined,
} from '@ant-design/icons';

export default function EventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await eventApi.list('active');
      if (res.data) {
        const data = res.data as any;
        setEvents(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSignup = async (eventId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await eventApi.signup(eventId);
      alert('报名成功！');
    } catch (err: any) {
      alert(err.message || '报名失败，请重试');
    }
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      roadshow: '路演',
      salon: '沙龙',
      training: '训练营',
      competition: '竞赛',
      lecture: '讲座',
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-[#0a2a5c] mb-2">活动路演</h1>
          <p className="text-gray-500">创业活动、项目路演、训练营，发现更多创业机会。</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div key={event.id} className="bg-white rounded-xl shadow-custom overflow-hidden border border-gray-100 hover:shadow-custom-lg transition-all">
                <div className="h-3 bg-gradient-to-r from-[#0a2a5c] to-[#f59e0b]" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-[#0a2a5c]/5 text-[#0a2a5c] rounded-lg text-xs font-medium">
                      {getEventTypeLabel(event.event_type)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      event.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {event.status === 'active' ? '进行中' : event.status === 'closed' ? '已结束' : '已取消'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0a2a5c] mb-3 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm text-gray-400 mb-5">
                    <div className="flex items-center">
                      <CalendarOutlined className="mr-2" />
                      {new Date(event.start_at).toLocaleDateString('zh-CN')} - {new Date(event.end_at).toLocaleDateString('zh-CN')}
                    </div>
                    <div className="flex items-center">
                      <EnvironmentOutlined className="mr-2" />
                      {event.location}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSignup(event.id)}
                    className="w-full px-4 py-2.5 bg-[#f59e0b] text-white rounded-lg hover:bg-[#f59e0b]/90 transition-colors text-sm font-medium"
                  >
                    立即报名
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <CalendarOutlined className="text-6xl mb-4 block" />
            <p className="text-lg">暂无活动</p>
            <p className="text-sm mt-2">还没有活动发布，敬请期待</p>
          </div>
        )}
      </div>
    </div>
  );
}