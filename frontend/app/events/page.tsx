'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventApi } from '@/lib/api';
import { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { message } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

export default function EventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedUpEventIds, setSignedUpEventIds] = useState<Set<number>>(new Set());
  const [signingUpId, setSigningUpId] = useState<number | null>(null);


  async function fetchEvents() {
    try {
      const res = await eventApi.list('active');
      if (res.data) {
        const data = res.data as { items: Event[] };
        setEvents(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMySignups() {
    try {
      const signedIds = new Set<number>();
      for (const event of events) {
        const res = await eventApi.getMySignup(event.id);
        if (res.data) {
          signedIds.add(event.id);
        }
      }
      setSignedUpEventIds(signedIds);
    } catch (err) {
      console.error('Failed to fetch signups:', err);
    }
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      fetchEvents();
    });
  }, []);

  useEffect(() => {
    if (user && events.length > 0) {
      requestAnimationFrame(() => {
        fetchMySignups();
      });
    }
  }, [user, events]);

  const handleSignup = async (eventId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSigningUpId(eventId);
    try {
      await eventApi.signup(eventId);
      setSignedUpEventIds(prev => new Set([...prev, eventId]));
      message.success('报名成功！');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '报名失败，请重试';
      message.error(errorMessage);
    } finally {
      setSigningUpId(null);
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
    <div className="min-h-screen bg-[#050510]">
      <div className="bg-gradient-to-br from-[#0a0a1a] to-[#050510] border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">活动路演</h1>
          <p className="text-gray-400">创业活动、项目路演、训练营，发现更多创业机会。</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && (
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black tracking-tight text-white mb-1">登录后即可报名活动</h3>
                <p className="text-sm text-gray-400">注册成为平台会员，参与创业活动、项目路演，与创业者面对面交流。</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/login"
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-300 text-sm"
                >
                  立即登录
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center px-6 py-2.5 bg-transparent border border-white/10 text-white rounded-xl hover:border-[#00f0ff]/40 hover:scale-105 transition-all duration-300 text-sm font-medium"
                >
                  立即注册
                </a>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
              <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
            </div>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event) => {
              const isSignedUp = signedUpEventIds.has(event.id);
              return (
                <Link href={`/events/${event.id}`} key={event.id} className="block bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-[#00f0ff]/20 hover:shadow-[0_0_25px_rgba(0,240,255,0.05)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="h-3 bg-gradient-to-r from-[#00f0ff] to-[#b347ea]" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-white/[0.04] text-gray-300 rounded-lg text-xs font-medium">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${event.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                        {event.status === 'active' ? '进行中' : event.status === 'closed' ? '已结束' : '已取消'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-white mb-3 line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-5">
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-2" />
                        {new Date(event.start_at).toLocaleDateString('zh-CN')} - {new Date(event.end_at).toLocaleDateString('zh-CN')}
                      </div>
                      <div className="flex items-center">
                        <EnvironmentOutlined className="mr-2" />
                        {event.location}
                      </div>
                    </div>
                    {user && !(user.role === 'admin' || user.role === 'super_admin') && (
                      isSignedUp ? (
                        <div className="w-full px-4 py-2.5 bg-[#00ff88]/10 text-[#00ff88] rounded-xl text-sm font-medium text-center flex items-center justify-center border border-[#00ff88]/20">
                          <CheckCircleOutlined className="mr-1.5" />
                          已报名
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSignup(event.id);
                          }}
                          disabled={signingUpId === event.id}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-[#ffb800] to-[#ff8c00] text-[#050510] rounded-xl font-bold hover:shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:scale-105 transition-all duration-300 text-sm disabled:opacity-50"
                        >
                          {signingUpId === event.id ? '报名中...' : '立即报名'}
                        </button>
                      )
                    )}
                  </div>
                </Link>
              )
            })}

          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarOutlined className="text-4xl text-gray-500" />
            </div>
            <p className="text-lg text-gray-500 font-medium">暂无活动</p>
            <p className="text-sm mt-2 text-gray-500">还没有活动发布，敬请期待</p>
          </div>
        )}
      </div>
    </div>
  );
}
