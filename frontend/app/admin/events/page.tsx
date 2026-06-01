'use client';

import { useEffect, useState } from 'react';
import { eventApi } from '@/lib/api';
import { Signup, Event } from '@/types';
import { formatDate } from '@/lib/utils';
import { message } from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showSignups, setShowSignups] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loadingSignups, setLoadingSignups] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'roadshow',
    location: '',
    start_at: '',
    end_at: '',
    status: 'active',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await eventApi.list();
      if (res.data) {
        const data = res.data as { items: Event[] };
        setEvents(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'roadshow',
      location: '',
      start_at: '',
      end_at: '',
      status: 'active',
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        start_at: formData.start_at ? new Date(formData.start_at).toISOString() : '',
        end_at: formData.end_at ? new Date(formData.end_at).toISOString() : '',
        status: editingEvent?.status || 'active',
      };
      if (editingEvent) {
        await eventApi.update(editingEvent.id, submitData);
        message.success('活动已更新');
      } else {
        await eventApi.create(submitData);
        message.success('活动已创建');
      }
      resetForm();
      loadEvents();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      location: event.location,
      start_at: event.start_at?.slice(0, 16) || '',
      end_at: event.end_at?.slice(0, 16) || '',
      status: event.status,
    });
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个活动吗？')) return;
    try {
      await eventApi.delete(id);
      loadEvents();
      message.success('活动已删除');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleViewSignups = async (event: Event) => {
    setSelectedEvent(event);
    setLoadingSignups(true);
    setShowSignups(true);
    try {
      const res = await eventApi.getSignups(event.id);
      if (res.data) {
        setSignups(res.data as Signup[]);
      }
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '获取报名列表失败');
    } finally {
      setLoadingSignups(false);
    }
  };

  const handleConfirmSignup = async (signupId: number) => {
    try {
      await eventApi.confirmSignup(signupId);
      const res = await eventApi.getSignups(selectedEvent?.id || 0);
      if (res.data) {
        setSignups(res.data as Signup[]);
      }
      message.success('已确认报名');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '确认失败');
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '草稿',
      active: '进行中',
      closed: '已结束',
      cancelled: '已取消',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-white/[0.05] text-gray-400',
      active: 'bg-[#00ff88]/10 text-[#00ff88]',
      closed: 'bg-[#00f0ff]/10 text-[#00f0ff]',
      cancelled: 'bg-red-500/10 text-red-400',
    };
    return colors[status] || 'bg-white/[0.05] text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-start pt-20 bg-[#050510]">
        <div className="relative flex justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/[0.06] border-t-[#00f0ff] animate-spin" />
          <div className="absolute w-7 h-7 rounded-full border-4 border-white/[0.04] border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">活动管理</h1>
          <p className="text-gray-400 mt-1">发布和管理创业活动、路演、训练营等。</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:opacity-90 transition-all duration-300 text-sm"
        >
          <PlusOutlined className="mr-1.5" /> 发布活动
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="bg-[#0f0f1f] rounded-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto border border-[#00f0ff]/10">
            <h2 className="text-xl font-black tracking-tight text-white mb-6">
              {editingEvent ? '编辑活动' : '发布新活动'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">活动标题</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
                  placeholder="输入活动标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">活动类型</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white"
                >
                  <option value="roadshow">路演</option>
                  <option value="salon">沙龙</option>
                  <option value="training">训练营</option>
                  <option value="competition">竞赛</option>
                  <option value="lecture">讲座</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">活动描述</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
                  rows={3}
                  placeholder="输入活动描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">活动地点</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
                  placeholder="输入活动地点"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">开始时间</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">结束时间</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_at}
                    min={formData.start_at || undefined}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:opacity-90 transition-all duration-300 text-sm"
                >
                  {editingEvent ? '保存修改' : '发布活动'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-transparent border border-white/10 text-white rounded-xl hover:bg-white/[0.05] transition-all duration-300 text-sm font-medium"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSignups && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowSignups(false); }}>
          <div className="bg-[#0f0f1f] rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-[#00f0ff]/10">
            <h2 className="text-xl font-black tracking-tight text-white mb-2">
              {selectedEvent?.title} - 报名管理
            </h2>
            <p className="text-gray-400 text-sm mb-6">共 {signups.length} 人报名</p>

            {loadingSignups ? (
              <div className="flex justify-center py-12">
                <div className="relative flex justify-center items-center">
                  <div className="w-10 h-10 rounded-full border-4 border-white/[0.06] border-t-[#00f0ff] animate-spin" />
                  <div className="absolute w-6 h-6 rounded-full border-4 border-white/[0.04] border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
                </div>
              </div>
            ) : signups.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.03] rounded-2xl mb-4">
                  <UserOutlined className="text-4xl text-gray-500" />
                </div>
                <p className="text-gray-500">暂无报名人员</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signups.map((signup) => (
                  <div key={signup.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center">
                        <UserOutlined className="text-gray-400 text-lg" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {signup.user?.nickname || signup.user?.username || '未知用户'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {signup.user?.email || signup.user?.phone || '未提供联系方式'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          报名时间：{new Date(signup.created_at).toLocaleDateString('zh-CN')} {new Date(signup.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${signup.status === 'confirmed' ? 'bg-[#00ff88]/10 text-[#00ff88]' :
                          signup.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                            'bg-[#ffb800]/10 text-[#ffb800]'
                        }`}>
                        {signup.status === 'confirmed' ? '已确认' :
                          signup.status === 'cancelled' ? '已取消' : '待确认'}
                      </span>
                      {signup.status !== 'confirmed' && signup.status !== 'cancelled' && (
                        <button
                          onClick={() => handleConfirmSignup(signup.id)}
                          className="px-4 py-2 text-xs bg-[#00ff88] text-[#050510] font-bold rounded-xl hover:bg-[#00ff88]/80 transition-all duration-300 flex items-center"
                        >
                          <CheckCircleOutlined className="mr-1" /> 确认
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSignups(false)}
                className="px-6 py-2.5 bg-transparent border border-white/10 text-white rounded-xl hover:bg-white/[0.05] transition-all duration-300 text-sm font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.03] rounded-2xl mb-4">
              <CalendarOutlined className="text-4xl text-gray-500" />
            </div>
            <p className="text-gray-500">暂无活动</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="text-[#ffb800] text-sm hover:underline mt-2"
            >
              发布第一个活动 &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">活动名称</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">类型</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">地点</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">时间</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {events.map((event: Event) => (
                  <tr key={event.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{event.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-white/[0.05] text-white rounded-xl text-xs font-medium">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{event.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div>{new Date(event.start_at).toLocaleDateString('zh-CN')}</div>
                      <div>至 {new Date(event.end_at).toLocaleDateString('zh-CN')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewSignups(event)}
                          className="px-3 py-1.5 text-xs bg-[#00f0ff]/10 text-[#00f0ff] rounded-xl hover:bg-[#00f0ff]/20 transition-all duration-300"
                        >
                          <TeamOutlined className="mr-1" /> 报名管理
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="px-3 py-1.5 text-xs bg-white/[0.03] text-gray-400 rounded-xl hover:bg-white/[0.06] hover:text-white transition-all duration-300"
                        >
                          <EditOutlined className="mr-1" /> 编辑
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300"
                        >
                          <DeleteOutlined className="mr-1" /> 结束活动
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
