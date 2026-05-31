'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { eventApi } from '@/lib/api';
import { Signup } from '@/types';
import Link from 'next/link';
import { message } from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FundOutlined,
  ExperimentOutlined,
  BuildOutlined,
  RocketOutlined,
} from '@ant-design/icons';

interface EventDetail {
  id: number;
  title: string;
  description: string;
  event_type: string;
  location: string;
  start_at: string;
  end_at: string;
  status: string;
  owner?: {
    id: number;
    nickname?: string;
    username?: string;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedUp, setSignedUp] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [mySignup, setMySignup] = useState<Signup | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loadingSignups, setLoadingSignups] = useState(false);



  async function fetchEvent() {
    try {
      const res = await eventApi.get(Number(params.id));
      if (res.data) {
        setEvent(res.data as EventDetail);
      }
    } catch (err) {
      console.error('Failed to fetch event:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMySignup() {
    try {
      const res = await eventApi.getMySignup(Number(params.id));
      if (res.data) {
        setMySignup(res.data as Signup);
        setSignedUp(true);
      }
    } catch (err) {
      console.error('Failed to fetch signup:', err);
    }
  }

  async function fetchSignups() {
    setLoadingSignups(true);
    try {
      const res = await eventApi.getSignups(Number(params.id));
      if (res.data) {
        setSignups(res.data as Signup[]);
      }
    } catch (err) {
      console.error('Failed to fetch signups:', err);
    } finally {
      setLoadingSignups(false);
    }
  }
  useEffect(() => {
    if (params.id) {
      requestAnimationFrame(() => {
        fetchEvent();
      });
    }
  }, [params.id]);

  useEffect(() => {
    if (user && params.id) {
      requestAnimationFrame(() => {
        if (user.role === 'admin' || user.role === 'super_admin') {
          fetchSignups();
        } else {
          fetchMySignup();
        }
      });
    }
  }, [user, params.id]);
  const handleSignup = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSigningUp(true);
    try {
      await eventApi.signup(Number(params.id));
      setSignedUp(true);
      message.success('报名成功！');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '报名失败，请重试';
      message.error(errorMessage);
    } finally {
      setSigningUp(false);
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: '进行中', color: 'bg-green-50 text-green-600', icon: CheckCircleOutlined };
      case 'closed':
        return { label: '已结束', color: 'bg-gray-100 text-gray-500', icon: ClockCircleOutlined };
      case 'cancelled':
        return { label: '已取消', color: 'bg-red-50 text-red-500', icon: ExclamationCircleOutlined };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-500', icon: ClockCircleOutlined };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ec]/50 flex items-center justify-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#e8dfd0] opacity-40"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#f59e0b] animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#0a2a5c] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#f7f3ec]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleOutlined className="text-4xl text-[#0a2a5c]/20" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0a2a5c]">活动不存在</h2>
          <Link href="/events" className="text-[#f59e0b] hover:text-[#d97706] font-medium mt-4 inline-block transition-colors">
            返回活动列表
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(event.status);

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#fefcf8] via-[#faf7f2] to-[#f5f0e8] border-b border-[#e8dfd0]"
        style={{ backgroundImage: 'radial-gradient(circle, #e8dfd0 1px, transparent 1px), linear-gradient(to bottom right, #fefcf8, #faf7f2, #f5f0e8)', backgroundSize: '20px 20px, auto', backgroundPosition: '0 0, 0 0' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/events"
            className="inline-flex items-center text-[#0a2a5c]/50 hover:text-[#0a2a5c] transition-colors mb-6 font-medium"
          >
            <ArrowLeftOutlined className="mr-2" />
            返回活动列表
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-[#f5f0e8] text-[#0a2a5c] rounded-lg text-sm font-medium">
                  {getEventTypeLabel(event.event_type)}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0a2a5c] mb-4">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-[#0a2a5c]/50">
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2 text-[#f59e0b]" />
                  <span>
                    {new Date(event.start_at).toLocaleDateString('zh-CN')} - {new Date(event.end_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center">
                  <ClockCircleOutlined className="mr-2 text-[#f59e0b]" />
                  <span>
                    {new Date(event.start_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center">
                  <EnvironmentOutlined className="mr-2 text-[#f59e0b]" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            {event.status === 'active' && user && !signedUp && !(user.role === 'admin' || user.role === 'super_admin') && (
              <div className="lg:w-80">
                <button
                  onClick={handleSignup}
                  disabled={signingUp}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-lg font-extrabold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signingUp ? '报名中...' : '立即报名'}
                </button>
              </div>
            )}

            {signedUp && (
              <div className="lg:w-80">
                <div className="px-6 py-4 bg-green-50 text-green-600 rounded-xl text-center border border-green-100">
                  <CheckCircleOutlined className="mr-2" />
                  <span className="font-medium">已报名</span>
                  {mySignup && (
                    <div className="mt-2 text-sm">
                      状态：
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${mySignup.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        mySignup.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                        {mySignup.status === 'confirmed' ? '已确认' :
                          mySignup.status === 'cancelled' ? '已取消' : '待确认'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 活动介绍 */}
            <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] p-6">
              <h2 className="text-xl font-extrabold tracking-tight text-[#0a2a5c] mb-4 flex items-center">
                <RocketOutlined className="mr-2 text-[#f59e0b]" />
                活动介绍
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-[#0a2a5c]/60 whitespace-pre-wrap leading-relaxed">
                  {event.description || '暂无活动介绍'}
                </p>
              </div>
            </div>

            {/* 活动须知 */}
            <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] p-6">
              <h2 className="text-xl font-extrabold tracking-tight text-[#0a2a5c] mb-4 flex items-center">
                <ExclamationCircleOutlined className="mr-2 text-[#f59e0b]" />
                活动须知
              </h2>
              <ul className="space-y-3 text-[#0a2a5c]/60">
                <li className="flex items-start">
                  <CheckCircleOutlined className="mr-2 mt-1 text-green-500" />
                  <span>请提前15分钟到达活动现场签到</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="mr-2 mt-1 text-green-500" />
                  <span>活动期间请保持手机静音</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="mr-2 mt-1 text-green-500" />
                  <span>如有疑问可在互动环节提问</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="mr-2 mt-1 text-green-500" />
                  <span>报名后如无法参加请提前取消报名</span>
                </li>
              </ul>
            </div>

            {/* 报名人员列表 - 仅管理员可见 */}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] p-6">
                <h2 className="text-xl font-extrabold tracking-tight text-[#0a2a5c] mb-4 flex items-center">
                  <TeamOutlined className="mr-2 text-[#f59e0b]" />
                  报名人员 ({signups.length})
                </h2>
                {loadingSignups ? (
                  <div className="flex justify-center py-8">
                    <div className="relative h-8 w-8">
                      <div className="absolute inset-0 rounded-full border-3 border-[#e8dfd0] opacity-40"></div>
                      <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-[#f59e0b] animate-spin"></div>
                    </div>
                  </div>
                ) : signups.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <UserOutlined className="text-2xl text-[#0a2a5c]/20" />
                    </div>
                    <p className="text-sm text-[#0a2a5c]/30">暂无报名人员</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {signups.map((signup) => (
                      <div key={signup.id} className="flex items-center justify-between p-3 rounded-xl bg-[#faf7f2] hover:bg-[#f5f0e8] transition-colors border border-[#e8dfd0]/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center">
                            <UserOutlined className="text-[#0a2a5c]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#0a2a5c]">
                              {signup.user?.nickname || signup.user?.username || '未知用户'}
                            </p>
                            <p className="text-xs text-[#0a2a5c]/30">
                              {signup.user?.email || signup.user?.phone || ''}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${signup.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                          signup.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                          {signup.status === 'confirmed' ? '已确认' :
                            signup.status === 'cancelled' ? '已取消' : '待确认'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 活动信息 */}
            <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] p-6">
              <h3 className="text-lg font-extrabold tracking-tight text-[#0a2a5c] mb-4">活动信息</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#e8dfd0]/50">
                  <span className="text-[#0a2a5c]/50">活动类型</span>
                  <span className="font-medium text-[#0a2a5c]">{getEventTypeLabel(event.event_type)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#e8dfd0]/50">
                  <span className="text-[#0a2a5c]/50">活动状态</span>
                  <span className={`font-medium ${statusInfo.color.split(' ')[1]}`}>{statusInfo.label}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#e8dfd0]/50">
                  <span className="text-[#0a2a5c]/50">活动地点</span>
                  <span className="font-medium text-[#0a2a5c] text-right max-w-[180px]">{event.location}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#e8dfd0]/50">
                  <span className="text-[#0a2a5c]/50">开始时间</span>
                  <span className="font-medium text-[#0a2a5c]">
                    {new Date(event.start_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#e8dfd0]/50">
                  <span className="text-[#0a2a5c]/50">结束时间</span>
                  <span className="font-medium text-[#0a2a5c]">
                    {new Date(event.end_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                {event.owner && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[#0a2a5c]/50">主办方</span>
                    <span className="font-medium text-[#0a2a5c]">
                      {event.owner.nickname || event.owner.username || '未知'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 资源对接入口 - 根据角色显示不同入口 */}
            {user && (user.role === 'investor' || user.role === 'mentor' || user.role === 'partner') && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl shadow-sm border border-purple-100 p-6">
                <h3 className="text-lg font-extrabold tracking-tight text-purple-800 mb-3">资源对接</h3>
                <p className="text-sm text-purple-600 mb-4">
                  作为{user.role === 'investor' ? '投资人' : user.role === 'mentor' ? '导师' : '资源方'}，您可以与优质创业项目进行资源对接。
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center px-4 py-2.5 bg-purple-600 text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium"
                >
                  <FundOutlined className="mr-2" />
                  浏览项目库
                </Link>
              </div>
            )}

            {/* 学生/团队入口 */}
            {user && (user.role === 'student' || user.role === 'team_owner') && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl shadow-sm border border-amber-100 p-6">
                <h3 className="text-lg font-extrabold tracking-tight text-amber-800 mb-3">创业机会</h3>
                <p className="text-sm text-amber-600 mb-4">
                  发现优质创业项目，寻找志同道合的团队成员，共同实现创业梦想。
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center px-4 py-2.5 bg-amber-600 text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium"
                >
                  <RocketOutlined className="mr-2" />
                  浏览项目库
                </Link>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}
