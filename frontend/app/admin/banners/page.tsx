'use client';

import { useEffect, useState } from 'react';
import { bannerApi, api } from '@/lib/api';
import { message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  status: string;
  created_at: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    status: 'active',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      const res = await bannerApi.listAll();
      if (res.data) {
        setBanners(res.data as Banner[]);
      }
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      status: 'active',
    });
    setEditingBanner(null);
    setShowForm(false);
    setImagePreviewError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await bannerApi.update(editingBanner.id, formData);
      } else {
        await bannerApi.create(formData);
      }
      resetForm();
      loadBanners();
    } catch (err: any) {
        message.error(err.message || '操作失败');
      }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      status: banner.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个轮播图吗？')) return;
    try {
      await bannerApi.delete(id);
      loadBanners();
    } catch (err: any) {
        message.error(err.message || '删除失败');
      }
  };

  const handleToggleStatus = async (banner: Banner) => {
    const newStatus = banner.status === 'active' ? 'inactive' : 'active';
    try {
      await bannerApi.update(banner.id, { status: newStatus });
      loadBanners();
      message.success(newStatus === 'active' ? '已显示' : '已隐藏');
    } catch (err: any) {
      message.error(err.message || '操作失败');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);

    try {
      const response = await api.uploadFile<{ url: string }>('/api/uploads', file);
      if (response.data?.url) {
        setFormData({ ...formData, image_url: response.data.url });
        setImagePreviewError(false);
      } else {
        throw new Error('上传失败，未返回图片地址');
      }
    } catch (err: any) {
      setUploadError(err.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
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
          <h1 className="text-2xl font-black tracking-tight text-white">轮播图管理</h1>
          <p className="text-gray-400 mt-1">管理首页轮播图</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2"
        >
          <PlusOutlined />
          添加轮播图
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-black tracking-tight text-white mb-4">
            {editingBanner ? '编辑轮播图' : '添加轮播图'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                标题 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={200}
                placeholder="请输入轮播图标题"
                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                图片 <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center space-x-3">
                {uploading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <LoadingOutlined />
                    <span>上传中...</span>
                  </div>
                ) : formData.image_url && !imagePreviewError ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="预览"
                      className="h-20 w-32 object-cover rounded-xl border border-white/[0.08]"
                      onError={() => setImagePreviewError(true)}
                    />
                    {imagePreviewError && (
                      <div className="absolute inset-0 bg-white/[0.03] rounded-xl flex items-center justify-center">
                        <PictureOutlined className="text-gray-500 text-xl" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-20 w-32 bg-white/[0.03] rounded-xl flex items-center justify-center">
                    <PictureOutlined className="text-gray-500 text-xl" />
                  </div>
                )}
                <label className="px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:opacity-90 transition-all duration-300 cursor-pointer flex items-center gap-2">
                  <UploadOutlined />
                  {formData.image_url ? '重新上传' : '上传图片'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              {uploadError && (
                <p className="mt-2 text-sm text-red-400">{uploadError}</p>
              )}
              {formData.image_url && (
                <p className="mt-2 text-sm text-gray-500 truncate">图片地址：{formData.image_url}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">支持 JPG/PNG/GIF/WebP 图片，建议尺寸 1920x500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                链接地址
              </label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://example.com (点击轮播图跳转的地址，选填)"
                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-gray-300"
              >
                <option value="active">显示</option>
                <option value="inactive">隐藏</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!formData.image_url}
                className="px-6 py-2 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editingBanner ? '保存修改' : '添加'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-transparent border border-white/10 text-white rounded-xl hover:bg-white/[0.05] transition-all duration-300"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.03] rounded-2xl mb-4">
            <PictureOutlined className="text-4xl text-gray-500" />
          </div>
          <p className="text-gray-500">暂无轮播图</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">图片</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">标题</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">链接</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">状态</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative h-16 w-24 bg-white/[0.03] rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="h-16 w-24 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <PictureOutlined className="text-gray-500 text-2xl absolute" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{banner.title}</td>
                  <td className="px-6 py-4">
                    {banner.link_url ? (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#00f0ff] hover:underline flex items-center gap-1"
                      >
                        <LinkOutlined />
                        访问
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">无</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        banner.status === 'active'
                          ? 'bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20'
                          : 'bg-white/[0.03] text-gray-400 hover:bg-white/[0.06]'
                      }`}
                    >
                      {banner.status === 'active' ? (
                        <>
                          <CheckCircleOutlined /> 显示
                        </>
                      ) : (
                        <>
                          <CloseCircleOutlined /> 隐藏
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded-xl transition-all duration-300"
                        title="编辑"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                        title="删除"
                      >
                        <DeleteOutlined />
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
  );
}
