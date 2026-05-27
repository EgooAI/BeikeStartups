'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import {
  FundOutlined,
  RocketOutlined,
  StarOutlined,
  ArrowRightOutlined,
  EyeOutlined,
} from '@ant-design/icons';

export default function InvestorPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await projectApi.list({ status: 'online', is_public: 'true' });
      if (res.data) {
        const data = res.data as any;
        setProjects(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FundOutlined className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">投资人专区</h1>
              <p className="text-purple-200">发现高校早期创新项目，连接年轻创业团队</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">128+</div>
              <div className="text-sm text-purple-200">校内创业项目</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">36+</div>
              <div className="text-sm text-purple-200">认证创业团队</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-purple-200">已对接投资人</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">20+</div>
              <div className="text-sm text-purple-200">成功融资项目</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <RocketOutlined className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-semibold text-[#0a2a5c] mb-2">发现优质项目</h3>
            <p className="text-sm text-gray-500">浏览经过认证的校园创业项目，发现有潜力的早期项目</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <StarOutlined className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-semibold text-[#0a2a5c] mb-2">收藏关注项目</h3>
            <p className="text-sm text-gray-500">收藏感兴趣的项目，随时跟踪项目进展和动态</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <EyeOutlined className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-semibold text-[#0a2a5c] mb-2">申请查看BP</h3>
            <p className="text-sm text-gray-500">对感兴趣的项目申请查看完整商业计划书</p>
          </div>
        </div>

        {/* Featured Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0a2a5c]">精选创业项目</h2>
            <Link href="/projects" className="text-purple-600 hover:text-purple-700 flex items-center text-sm font-medium">
              查看全部 <ArrowRightOutlined className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent" />
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-custom p-6 border border-gray-100 hover:shadow-custom-lg transition-all">
                  <div className="h-36 bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center mb-4">
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <RocketOutlined className="text-4xl text-purple-300" />
                    )}
                  </div>
                  <h3 className="font-semibold text-[#0a2a5c] mb-2 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tags?.split(',').slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-md text-xs">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    查看详情 <ArrowRightOutlined className="ml-1 text-xs" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <RocketOutlined className="text-5xl mb-3 block" />
              <p>暂无公开项目</p>
            </div>
          )}
        </div>

        {/* CTA */}
        {!user?.role || (user.role !== 'investor' && user.role !== 'super_admin') && (
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">成为认证投资人</h3>
            <p className="text-purple-100 mb-6">获得更多专属权益：查看完整BP、报名闭门路演、发起对接申请</p>
            <Link
              href="/role-request?role=investor"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            >
              申请投资人认证 <ArrowRightOutlined className="ml-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
