'use client';

import { useEffect, useState } from 'react';
import { resourceApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
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
      <div className="min-h-screen flex justify-center items-start pt-20 bg-[#f7f3ec]/50">
        <div className="relative flex justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#e8dfd0] border-t-[#0a2a5c] animate-spin" />
          <div className="absolute w-7 h-7 rounded-full border-4 border-[#f5f0e8] border-b-[#f59e0b] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c]">资源管理</h1>
          <p className="text-[#8b7e6a] mt-1">管理平台上的资源合作信息，共 {resources.length} 条</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center px-4 py-2.5 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <PlusOutlined className="mr-1.5" /> 添加资源
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="bg-[#fefcf8] rounded-2xl shadow-xl max-w-lg w-full p-8 border border-[#e8dfd0]">
            <h2 className="text-xl font-extrabold tracking-tight text-[#0a2a5c] mb-6">
              {editingResource ? '编辑资源' : '添加资源'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6b5e4a] mb-1.5">资源标题</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  placeholder="输入资源标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b5e4a] mb-1.5">资源类型</label>
                <select
                  value={formData.resource_type}
                  onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
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
                <label className="block text-sm font-medium text-[#6b5e4a] mb-1.5">资源描述</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  rows={3}
                  placeholder="输入资源描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b5e4a] mb-1.5">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  placeholder="例如: 孵化器, 办公空间, 创业服务"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b5e4a] mb-1.5">联系方式</label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  placeholder="手机/邮箱/微信"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {editingResource ? '保存修改' : '添加资源'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-[#e8dfd0] text-[#6b5e4a] rounded-xl hover:bg-[#faf7f2] transition-all duration-300 text-sm font-medium hover:-translate-y-0.5"
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
          <div className="col-span-full bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f5f0e8] rounded-2xl mb-4">
              <BuildOutlined className="text-4xl text-[#a89a80]" />
            </div>
            <p className="text-[#a89a80]">暂无资源信息</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="text-[#f59e0b] text-sm hover:underline mt-2"
            >
              添加第一条资源 &rarr;
            </button>
          </div>
        ) : (
          resources.map((res: Resource) => (
            <div key={res.id} className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 bg-[#f5f0e8] text-[#0a2a5c] rounded-xl text-xs font-medium">
                  {getResourceTypeLabel(res.resource_type)}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(res)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-[#a89a80] hover:text-[#0a2a5c] hover:bg-[#faf7f2] transition-all duration-300"
                  >
                    <EditOutlined />
                  </button>
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-[#a89a80] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
              <h3 className="font-extrabold tracking-tight text-[#0a2a5c] mb-2">{res.title}</h3>
              <p className="text-sm text-[#6b5e4a] line-clamp-2 mb-4">{res.description}</p>
              {res.tags && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {res.tags.split(',').map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-[#f5f0e8] text-[#8b7e6a] rounded-xl text-xs">{tag.trim()}</span>
                  ))}
                </div>
              )}
              <div className="border-t border-[#e8dfd0] pt-3 flex items-center justify-between text-xs">
                <span className="text-[#a89a80]">联系人: {res.contact}</span>
                <span className="text-[#a89a80]">{new Date(res.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
