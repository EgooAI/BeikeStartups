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
    <div className="min-h-screen bg-[#f7f3ec]/50">
      <div className="bg-gradient-to-br from-[#fefcf8] via-[#faf7f2] to-[#f5f0e8] border-b border-[#e8dfd0]"
        style={{ backgroundImage: 'radial-gradient(circle, #e8dfd0 1px, transparent 1px), linear-gradient(to bottom right, #fefcf8, #faf7f2, #f5f0e8)', backgroundSize: '20px 20px, auto', backgroundPosition: '0 0, 0 0' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0a2a5c] mb-2">活动路演</h1>
          <p className="text-[#0a2a5c]/50">创业活动、项目路演、训练营，发现更多创业机会。</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && (
          <div className="bg-gradient-to-r from-[#fefcf8] to-[#faf7f2] rounded-xl p-6 mb-8 border border-[#e8dfd0] shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-[#0a2a5c] mb-1">登录后即可报名活动</h3>
                <p className="text-sm text-[#0a2a5c]/50">注册成为平台会员，参与创业活动、项目路演，与创业者面对面交流。</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/login"
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#0a2a5c] to-[#1a4a8a] text-white font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm"
                >
                  立即登录
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center px-6 py-2.5 bg-[#fefcf8] text-[#0a2a5c] font-semibold rounded-xl border border-[#e8dfd0] hover:bg-[#faf7f2] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm"
                >
                  立即注册
                </a>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#e8dfd0] opacity-40"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#f59e0b] animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#0a2a5c] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
            </div>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event) => {
              const isSignedUp = signedUpEventIds.has(event.id);
              return (
                <Link href={`/events/${event.id}`} key={event.id} className="block bg-[#fefcf8] rounded-xl shadow-sm overflow-hidden border border-[#e8dfd0] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="h-3 bg-gradient-to-r from-[#0a2a5c] to-[#f59e0b]" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-[#f5f0e8] text-[#0a2a5c] rounded-lg text-xs font-medium">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${event.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {event.status === 'active' ? '进行中' : event.status === 'closed' ? '已结束' : '已取消'}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold tracking-tight text-[#0a2a5c] mb-3 line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-[#0a2a5c]/50 line-clamp-2 mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm text-[#0a2a5c]/40 mb-5">
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
                        <div className="w-full px-4 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-medium text-center flex items-center justify-center shadow-sm">
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
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium disabled:opacity-50"
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
            <div className="w-20 h-20 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarOutlined className="text-4xl text-[#0a2a5c]/20" />
            </div>
            <p className="text-lg text-[#0a2a5c]/40 font-medium">暂无活动</p>
            <p className="text-sm mt-2 text-[#0a2a5c]/30">还没有活动发布，敬请期待</p>
          </div>
        )}
      </div>
    </div>
  );
}
