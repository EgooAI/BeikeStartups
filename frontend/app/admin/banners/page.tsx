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
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c]">轮播图管理</h1>
          <p className="text-[#8b7e6a] mt-1">管理首页轮播图</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <PlusOutlined />
          添加轮播图
        </button>
      </div>

      {showForm && (
        <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] p-6 mb-6">
          <h3 className="text-lg font-extrabold tracking-tight text-[#0a2a5c] mb-4">
            {editingBanner ? '编辑轮播图' : '添加轮播图'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6b5e4a] mb-1">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={200}
                placeholder="请输入轮播图标题"
                className="w-full px-4 py-2 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6b5e4a] mb-1">
                图片 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                {uploading ? (
                  <div className="flex items-center gap-2 text-[#8b7e6a]">
                    <LoadingOutlined />
                    <span>上传中...</span>
                  </div>
                ) : formData.image_url && !imagePreviewError ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="预览"
                      className="h-20 w-32 object-cover rounded-xl border border-[#e8dfd0]"
                      onError={() => setImagePreviewError(true)}
                    />
                    {imagePreviewError && (
                      <div className="absolute inset-0 bg-[#f5f0e8] rounded-xl flex items-center justify-center">
                        <PictureOutlined className="text-[#a89a80] text-xl" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-20 w-32 bg-[#f5f0e8] rounded-xl flex items-center justify-center">
                    <PictureOutlined className="text-[#a89a80] text-xl" />
                  </div>
                )}
                <label className="px-4 py-2 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
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
                <p className="mt-2 text-sm text-red-500">{uploadError}</p>
              )}
              {formData.image_url && (
                <p className="mt-2 text-sm text-[#a89a80] truncate">图片地址：{formData.image_url}</p>
              )}
              <p className="mt-2 text-xs text-[#a89a80]">支持 JPG/PNG/GIF/WebP 图片，建议尺寸 1920x500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6b5e4a] mb-1">
                链接地址
              </label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://example.com (点击轮播图跳转的地址，选填)"
                className="w-full px-4 py-2 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6b5e4a] mb-1">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              >
                <option value="active">显示</option>
                <option value="inactive">隐藏</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!formData.image_url}
                className="px-6 py-2 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-all duration-300 disabled:bg-[#c4b69c] disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                {editingBanner ? '保存修改' : '添加'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-[#e8dfd0] text-[#6b5e4a] rounded-xl hover:bg-[#faf7f2] transition-all duration-300 hover:-translate-y-0.5"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f5f0e8] rounded-2xl mb-4">
            <PictureOutlined className="text-4xl text-[#a89a80]" />
          </div>
          <p className="text-[#a89a80]">暂无轮播图</p>
        </div>
      ) : (
        <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#faf7f2]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8b7e6a]">图片</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8b7e6a]">标题</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8b7e6a]">链接</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8b7e6a]">状态</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8b7e6a]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8dfd0]">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-[#faf7f2] transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative h-16 w-24 bg-[#f5f0e8] rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="h-16 w-24 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <PictureOutlined className="text-[#c4b69c] text-2xl absolute" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#3a2e1a]">{banner.title}</td>
                  <td className="px-6 py-4">
                    {banner.link_url ? (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#0a2a5c] hover:underline flex items-center gap-1"
                      >
                        <LinkOutlined />
                        访问
                      </a>
                    ) : (
                      <span className="text-sm text-[#a89a80]">无</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                        banner.status === 'active'
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-[#f5f0e8] text-[#8b7e6a] hover:bg-[#e8dfd0]'
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
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                        title="编辑"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
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
