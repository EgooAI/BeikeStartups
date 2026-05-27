'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import {
  RocketOutlined,
  TeamOutlined,
  UserOutlined,
  FundOutlined,
  RightOutlined,
  StarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const stats = [
  { value: '128+', label: '入驻项目', icon: <RocketOutlined />, desc: '个校内创业项目' },
  { value: '36+', label: '认证团队', icon: <TeamOutlined />, desc: '支创业团队' },
  { value: '50+', label: '导师资源', icon: <UserOutlined />, desc: '位校外导师' },
  { value: '20+', label: '投资机构', icon: <FundOutlined />, desc: '家合作投资机构' },
];

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await projectApi.list({ status: 'online', is_public: 'true' });
        if (res.data) {
          const data = res.data as any;
          setFeaturedProjects(data.items?.slice(0, 4) || []);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0a2a5c] via-[#0f3a7a] to-[#1a4a8a] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="lg:w-3/5">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-[#f59e0b] mb-8 border border-white/10">
              <StarOutlined className="mr-2" />
              新一代贝壳创业俱乐部
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              让校园创业项目，
              <br />
              <span className="text-[#f59e0b]">被更多人看见</span>。
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-10 max-w-2xl">
              面向高校学生创业团队，连接校内创新项目、校外导师、投资人和产业资源，
              打造真实、高效、开放的校园创投生态平台。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center px-8 py-4 bg-[#f59e0b] text-[#0a2a5c] font-semibold rounded-xl hover:bg-[#f59e0b]/90 transition-all shadow-lg shadow-[#f59e0b]/25"
              >
                浏览创业项目
                <RightOutlined className="ml-2" />
              </Link>
              <Link
                href="/teams/create"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                申请成为创业团队
                <ArrowRightOutlined className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-custom-lg p-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0a2a5c]/5 rounded-xl text-[#0a2a5c] mb-3">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-[#0a2a5c]">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a2a5c] mb-4">精选校园创业项目</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              发现来自校园的创新力量，看见下一批值得期待的年轻创业团队。
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#0a2a5c] border-t-transparent" />
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group bg-white rounded-xl shadow-custom hover:shadow-custom-lg transition-all overflow-hidden border border-gray-100"
                >
                  <div className="h-40 bg-gradient-to-br from-[#0a2a5c]/5 to-[#1a4a8a]/10 flex items-center justify-center">
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <RocketOutlined className="text-4xl text-[#0a2a5c]/30" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-[#0a2a5c] group-hover:text-[#f59e0b] transition-colors mb-2 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags?.split(',').slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                          {tag.trim()}
                        </span>
                      ))}
                      {project.team && (
                        <span className="px-2.5 py-1 bg-[#f59e0b]/10 text-[#f59e0b] rounded-md text-xs font-medium">
                          种子计划
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <RocketOutlined className="text-5xl mb-4 block" />
              <p>暂无精选项目，敬请期待</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              href="/projects"
              className="inline-flex items-center px-6 py-3 text-[#0a2a5c] font-medium hover:text-[#f59e0b] transition-colors"
            >
              查看全部项目 <ArrowRightOutlined className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            从一个想法，到一个真正的创业项目
          </h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            在这里，同学可以发现项目，团队可以发布项目，导师可以辅导项目，
            投资人可以发现项目，资源方可以支持项目。
            <br />
            贝壳创业俱乐部，陪伴校园创业团队从种子阶段走向更大的舞台。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-[#f59e0b] text-[#0a2a5c] font-semibold rounded-xl hover:bg-[#f59e0b]/90 transition-all shadow-lg shadow-[#f59e0b]/25"
            >
              立即加入 <ArrowRightOutlined className="ml-2" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}