'use client';

import { useEffect, useState } from 'react';
import { resourceApi } from '@/lib/api';
import { message } from 'antd';
import {
  BuildOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

interface Resource {
  id: number;
  title: string;
  description?: string;
  resource_type: string;
  tags?: string;
  contact: string;
  created_at: string;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'office',
    tags: '',
    contact: '',
  });

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {
      const res = await resourceApi.list();
      if (res.data) {
        const data = res.data as { items: unknown[] };
        setResources((data.items as Resource[]) || []);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resource_type: 'office',
      tags: '',
      contact: '',
    });
    setEditingResource(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await resourceApi.update(editingResource.id, formData);
        message.success('资源已更新');
      } else {
        await resourceApi.create(formData);
        message.success('资源已创建');
      }
      resetForm();
      loadResources();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
    }
  };

  const handleEdit = (res: Resource) => {
    setFormData({
      title: res.title,
      description: res.description || '',
      resource_type: res.resource_type,
      tags: res.tags || '',
      contact: res.contact || '',
    });
    setEditingResource(res);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个资源吗？')) return;
    try {
      await resourceApi.delete(id);
      loadResources();
      message.success('资源已删除');
    } catch (err) {
      message.error((err as Error).message || '删除失败');
    }
  };

  const getResourceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      office: '办公空间',
      tech: '技术服务',
      supply: '供应链',
      media: '媒体曝光',
      legal: '法律财税',
      capital: '资金支持',
      channel: '渠道合作',
      other: '其他',
    };
    return types[type] || type;
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
          <h1 className="text-2xl font-black tracking-tight text-white">资源管理</h1>
          <p className="text-gray-400 mt-1">管理平台上的资源合作信息，共 {resources.length} 条</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:opacity-90 transition-all duration-300 text-sm"
        >
          <PlusOutlined className="mr-1.5" /> 添加资源
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="bg-[#0f0f1f] rounded-2xl max-w-lg w-full p-8 border border-[#00f0ff]/10">
            <h2 className="text-xl font-black tracking-tight text-white mb-6">
              {editingResource ? '编辑资源' : '添加资源'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">资源标题</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
                  placeholder="输入资源标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">资源类型</label>
                <select
                  value={formData.resource_type}
                  onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-gray-300"
                >
                  <option value="office">办公空间</option>
                  <option value="tech">技术服务</option>
                  <option value="supply">供应链</option>
                  <option value="media">媒体曝光</option>
                  <option value="legal">法律财税</option>
                  <option value="capital">资金支持</option>
                  <option value="channel">渠道合作</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">资源描述</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
                  rows={3}
                  placeholder="输入资源描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
                  placeholder="例如: 孵化器, 办公空间, 创业服务"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">联系方式</label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
                  placeholder="手机/邮箱/微信"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:opacity-90 transition-all duration-300 text-sm"
                >
                  {editingResource ? '保存修改' : '添加资源'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.length === 0 ? (
          <div className="col-span-full bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.03] rounded-2xl mb-4">
              <BuildOutlined className="text-4xl text-gray-500" />
            </div>
            <p className="text-gray-500">暂无资源信息</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="text-[#ffb800] text-sm hover:underline mt-2"
            >
              添加第一条资源 &rarr;
            </button>
          </div>
        ) : (
          resources.map((res: Resource) => (
            <div key={res.id} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 bg-white/[0.05] text-gray-300 rounded-xl text-xs font-medium">
                  {getResourceTypeLabel(res.resource_type)}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(res)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all duration-300"
                  >
                    <EditOutlined />
                  </button>
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
              <h3 className="font-black tracking-tight text-white mb-2">{res.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-4">{res.description}</p>
              {res.tags && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {res.tags.split(',').map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-white/[0.03] text-gray-400 rounded-xl text-xs">{tag.trim()}</span>
                  ))}
                </div>
              )}
              <div className="border-t border-white/[0.05] pt-3 flex items-center justify-between text-xs">
                <span className="text-gray-500">联系人: {res.contact}</span>
                <span className="text-gray-500">{new Date(res.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
