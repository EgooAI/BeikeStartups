'use client';

import { useEffect, useState } from 'react';
import { eventApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
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
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showSignups, setShowSignups] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [signups, setSignups] = useState<any[]>([]);
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
        const data = res.data as any;
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
      } else {
        await eventApi.create(submitData);
      }
      resetForm();
      loadEvents();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleEdit = (event: any) => {
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
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const handleViewSignups = async (event: any) => {
    setSelectedEvent(event);
    setLoadingSignups(true);
    setShowSignups(true);
    try {
      const res = await eventApi.getSignups(event.id);
      if (res.data) {
        setSignups(res.data as any[]);
      }
    } catch (err: any) {
      alert(err.message || '获取报名列表失败');
    } finally {
      setLoadingSignups(false);
    }
  };

  const handleConfirmSignup = async (signupId: number) => {
    try {
      await eventApi.confirmSignup(signupId);
      const res = await eventApi.getSignups(selectedEvent.id);
      if (res.data) {
        setSignups(res.data as any[]);
      }
      alert('已确认报名');
    } catch (err: any) {
      alert(err.message || '确认失败');
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
      draft: 'bg-gray-100 text-gray-500',
      active: 'bg-green-50 text-green-600',
      closed: 'bg-blue-50 text-blue-600',
      cancelled: 'bg-red-50 text-red-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2a5c]">活动管理</h1>
          <p className="text-gray-500 mt-1">发布和管理创业活动、路演、训练营等。</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center px-4 py-2.5 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors text-sm font-medium"
        >
          <PlusOutlined className="mr-1.5" /> 发布活动
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#0a2a5c] mb-6">
              {editingEvent ? '编辑活动' : '发布新活动'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">活动标题</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  placeholder="输入活动标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">活动类型</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                >
                  <option value="roadshow">路演</option>
                  <option value="salon">沙龙</option>
                  <option value="training">训练营</option>
                  <option value="competition">竞赛</option>
                  <option value="lecture">讲座</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">活动描述</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  rows={3}
                  placeholder="输入活动描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">活动地点</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  placeholder="输入活动地点"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">开始时间</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">结束时间</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_at}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#0a2a5c] text-white rounded-lg hover:bg-[#0a2a5c]/90 transition-colors text-sm font-medium"
                >
                  {editingEvent ? '保存修改' : '发布活动'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSignups && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowSignups(false); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#0a2a5c] mb-2">
              {selectedEvent?.title} - 报名管理
            </h2>
            <p className="text-gray-500 text-sm mb-6">共 {signups.length} 人报名</p>

            {loadingSignups ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#0a2a5c] border-t-transparent" />
              </div>
            ) : signups.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <UserOutlined className="text-5xl mb-3 block" />
                <p>暂无报名人员</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signups.map((signup) => (
                  <div key={signup.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#0a2a5c]/10 flex items-center justify-center">
                        <UserOutlined className="text-[#0a2a5c] text-lg" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0a2a5c]">
                          {signup.user?.nickname || signup.user?.username || '未知用户'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {signup.user?.email || signup.user?.phone || '未提供联系方式'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          报名时间：{new Date(signup.created_at).toLocaleDateString('zh-CN')} {new Date(signup.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        signup.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                        signup.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {signup.status === 'confirmed' ? '已确认' :
                         signup.status === 'cancelled' ? '已取消' : '待确认'}
                      </span>
                      {signup.status !== 'confirmed' && signup.status !== 'cancelled' && (
                        <button
                          onClick={() => handleConfirmSignup(signup.id)}
                          className="px-4 py-2 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
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
                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CalendarOutlined className="text-5xl mb-3 block" />
            <p>暂无活动</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="text-[#f59e0b] text-sm hover:underline mt-2"
            >
              发布第一个活动 →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">活动名称</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">类型</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">地点</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">时间</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event: any) => (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#0a2a5c]">{event.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-[#0a2a5c]/5 text-[#0a2a5c] rounded-lg text-xs">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{event.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(event.start_at).toLocaleDateString('zh-CN')}
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
                          className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <TeamOutlined className="mr-1" /> 报名管理
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <EditOutlined className="mr-1" /> 编辑
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
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