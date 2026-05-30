'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import { isAuthenticated } from '@/lib/auth';
import BannerCarousel from '@/components/Common/BannerCarousel';
import {
  RocketOutlined,
  TeamOutlined,
  UserOutlined,
  FundOutlined,
  RightOutlined,
  StarOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  TagOutlined,
  RiseOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const stats = [
  { value: '128+', label: '入驻项目', icon: <RocketOutlined />, desc: '个校内创业项目', color: 'from-blue-500 to-blue-600' },
  { value: '36+', label: '认证团队', icon: <TeamOutlined />, desc: '支创业团队', color: 'from-amber-500 to-orange-500' },
  { value: '50+', label: '导师资源', icon: <UserOutlined />, desc: '位校外导师', color: 'from-purple-500 to-violet-500' },
  { value: '20+', label: '投资机构', icon: <FundOutlined />, desc: '家合作投资机构', color: 'from-emerald-500 to-teal-500' },
];

const features = [
  {
    icon: <BulbOutlined />,
    title: '发现优质项目',
    description: '汇聚校园内经过认证的创业项目，发现下一批值得期待的年轻创业团队。',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: <TagOutlined />,
    title: '精准资源匹配',
    description: '智能匹配投资人、导师与项目，实现高效的投融资对接与辅导。',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: <RiseOutlined />,
    title: '全周期孵化',
    description: '从种子期到成熟期，陪伴创业项目成长的每一个阶段。',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: <TrophyOutlined />,
    title: '认证保障',
    description: '严格的项目审核机制，确保平台项目的真实性与质量。',
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    setIsLoggedIn(isAuthenticated());
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
      <BannerCarousel />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-primary-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-light/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="lg:w-3/5">
            <div className={`inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-amber-300 mb-8 border border-white/10 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
              <StarOutlined className="mr-2" />
              新一代贝壳创业俱乐部
            </div>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`}>
              让校园创业项目，
              <br />
              <span className="text-gradient-gold">被更多人看见</span>。
            </h1>
            <p className={`text-lg sm:text-xl text-gray-200 leading-relaxed mb-10 max-w-2xl ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              面向高校学生创业团队，连接校内创新项目、校外导师、投资人和产业资源，
              打造真实、高效、开放的校园创投生态平台。
            </p>
            <div className={`flex flex-wrap gap-4 ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <Link
                href="/projects"
                className="inline-flex items-center px-8 py-4 bg-accent-gradient text-primary font-semibold rounded-xl hover:opacity-90 transition-all shadow-button hover:shadow-lg hover:-translate-y-0.5"
              >
                浏览创业项目
                <RightOutlined className="ml-2" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
              >
                加入我们
                <ArrowRightOutlined className="ml-2" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-8 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-custom-lg p-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">为什么选择贝壳青创汇</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              专为校园创业者打造的一站式创业服务平台，连接资源，助力成长。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 shadow-custom hover:shadow-custom-lg transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">精选校园创业项目</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              发现来自校园的创新力量，看见下一批值得期待的年轻创业团队。
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-primary border-t-transparent" />
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProjects.map((project, index) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group bg-white rounded-2xl shadow-custom hover:shadow-custom-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-44 bg-gradient-to-br from-primary/5 to-primary-light/10 flex items-center justify-center overflow-hidden">
                    {project.cover_image ? (
                      <img 
                        src={project.cover_image} 
                        alt={project.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <RocketOutlined className="text-5xl text-primary/20" />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-accent-gradient text-white text-xs rounded-full font-medium shadow-button">
                        种子计划
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-primary group-hover:text-accent transition-colors mb-2 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags?.split(',').slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                          {tag.trim()}
                        </span>
                      ))}
                      {project.team && (
                        <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-lg text-xs font-medium">
                          已认证
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <RocketOutlined className="text-6xl mb-4 block" />
              <p className="text-lg">暂无精选项目</p>
              <p className="text-sm mt-2">还没有项目发布，敬请期待</p>
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              href="/projects"
              className="inline-flex items-center px-6 py-3 text-primary font-medium hover:text-accent transition-colors group"
            >
              查看全部项目 <ArrowRightOutlined className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            从一个想法，到一个真正的创业项目
          </h2>
          <p className="text-gray-200 text-lg mb-10 leading-relaxed">
            在这里，同学可以发现项目，团队可以发布项目，导师可以辅导项目，
            投资人可以发现项目，资源方可以支持项目。
            <br />
            贝壳创业俱乐部，陪伴校园创业团队从种子阶段走向更大的舞台。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={isLoggedIn ? '/dashboard' : '/register'}
              className="inline-flex items-center px-8 py-4 bg-accent-gradient text-primary font-semibold rounded-xl hover:opacity-90 transition-all shadow-button hover:shadow-lg hover:-translate-y-0.5"
            >
              {isLoggedIn ? '马上行动' : '立即加入'} <ArrowRightOutlined className="ml-2" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
