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
    <div className="min-h-screen bg-[#050510]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0a0a1a] via-[#050510] to-[#0a0a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/[0.06] backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/[0.08]">
              <FundOutlined className="text-3xl text-[#00f0ff]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">投资人专区</h1>
              <p className="text-gray-400">发现高校早期创新项目，连接年轻创业团队</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06]">
              <div className="text-3xl font-bold text-[#00f0ff]">128+</div>
              <div className="text-sm text-gray-400">校内创业项目</div>
            </div>
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06]">
              <div className="text-3xl font-bold text-[#b347ea]">36+</div>
              <div className="text-sm text-gray-400">认证创业团队</div>
            </div>
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06]">
              <div className="text-3xl font-bold text-[#ffb800]">50+</div>
              <div className="text-sm text-gray-400">已对接投资人</div>
            </div>
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06]">
              <div className="text-3xl font-bold text-[#00ff88]">20+</div>
              <div className="text-sm text-gray-400">成功融资项目</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-[#00f0ff]/20 hover:shadow-[0_0_25px_rgba(0,240,255,0.05)] transition-all duration-300">
            <div className="w-12 h-12 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-xl flex items-center justify-center mb-4">
              <RocketOutlined className="text-[#00f0ff] text-xl" />
            </div>
            <h3 className="font-black tracking-tight text-white mb-2">发现优质项目</h3>
            <p className="text-sm text-gray-400">浏览经过认证的校园创业项目，发现有潜力的早期项目</p>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-[#00f0ff]/20 hover:shadow-[0_0_25px_rgba(0,240,255,0.05)] transition-all duration-300">
            <div className="w-12 h-12 bg-[#b347ea]/10 border border-[#b347ea]/20 rounded-xl flex items-center justify-center mb-4">
              <StarOutlined className="text-[#b347ea] text-xl" />
            </div>
            <h3 className="font-black tracking-tight text-white mb-2">收藏关注项目</h3>
            <p className="text-sm text-gray-400">收藏感兴趣的项目，随时跟踪项目进展和动态</p>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-[#00f0ff]/20 hover:shadow-[0_0_25px_rgba(0,240,255,0.05)] transition-all duration-300">
            <div className="w-12 h-12 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-xl flex items-center justify-center mb-4">
              <EyeOutlined className="text-[#00ff88] text-xl" />
            </div>
            <h3 className="font-black tracking-tight text-white mb-2">申请查看BP</h3>
            <p className="text-sm text-gray-400">对感兴趣的项目申请查看完整商业计划书</p>
          </div>
        </div>

        {/* Featured Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black tracking-tight text-white">精选创业项目</h2>
            <Link href="/projects" className="text-[#00f0ff] hover:text-[#00d0ff] flex items-center text-sm font-medium transition-colors">
              查看全部 <ArrowRightOutlined className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
                <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
              </div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <div key={project.id} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-[#00f0ff]/20 hover:shadow-[0_0_25px_rgba(0,240,255,0.05)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="h-36 bg-white/[0.03] rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-white/[0.05]">
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <RocketOutlined className="text-4xl text-gray-500" />
                    )}
                  </div>
                  <h3 className="font-black tracking-tight text-white mb-2 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tags?.split(',').slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-white/[0.04] text-gray-400 rounded-md text-xs font-medium border border-white/[0.06]">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center text-[#00f0ff] hover:text-[#00d0ff] text-sm font-medium transition-colors"
                  >
                    查看详情 <ArrowRightOutlined className="ml-1 text-xs" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <RocketOutlined className="text-4xl text-gray-500" />
              </div>
              <p className="text-gray-500 font-medium">暂无公开项目</p>
            </div>
          )}
        </div>

        {/* CTA */}
        {!user?.role || (user.role !== 'investor' && user.role !== 'super_admin') && (
          <div className="mt-12 bg-gradient-to-r from-[#b347ea]/20 to-[#00f0ff]/10 rounded-2xl p-8 text-center border border-[#b347ea]/20">
            <h3 className="text-xl font-black tracking-tight text-white mb-2">成为认证投资人</h3>
            <p className="text-gray-400 mb-6">获得更多专属权益：查看完整BP、报名闭门路演、发起对接申请</p>
            <Link
              href="/role-request?role=investor"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] rounded-xl font-bold hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-300"
            >
              申请投资人认证 <ArrowRightOutlined className="ml-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
