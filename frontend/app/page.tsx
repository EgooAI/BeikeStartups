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
  AuditOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  SmileOutlined,
} from '@ant-design/icons';

const stats = [
  { value: '128+', label: '入驻项目', icon: <RocketOutlined />, desc: '个校内创业项目', gradient: 'from-blue-500 to-blue-600', bgGlow: 'bg-blue-500/10' },
  { value: '36+', label: '认证团队', icon: <TeamOutlined />, desc: '支创业团队', gradient: 'from-amber-500 to-orange-500', bgGlow: 'bg-amber-500/10' },
  { value: '50+', label: '导师资源', icon: <UserOutlined />, desc: '位校外导师', gradient: 'from-purple-500 to-violet-500', bgGlow: 'bg-purple-500/10' },
  { value: '20+', label: '投资机构', icon: <FundOutlined />, desc: '家合作投资机构', gradient: 'from-emerald-500 to-teal-500', bgGlow: 'bg-emerald-500/10' },
];

const features = [
  {
    icon: <BulbOutlined />,
    title: '发现优质项目',
    description: '汇聚校园内经过认证的创业项目，发现下一批值得期待的年轻创业团队。',
    gradient: 'from-blue-500 to-blue-600',
    bgGlow: 'bg-blue-500/10',
    accent: 'text-blue-600',
  },
  {
    icon: <TagOutlined />,
    title: '精准资源匹配',
    description: '智能匹配投资人、导师与项目，实现高效的投融资对接与辅导。',
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/10',
    accent: 'text-amber-600',
  },
  {
    icon: <RiseOutlined />,
    title: '全周期孵化',
    description: '从种子期到成熟期，陪伴创业项目成长的每一个阶段。',
    gradient: 'from-purple-500 to-violet-500',
    bgGlow: 'bg-purple-500/10',
    accent: 'text-purple-600',
  },
  {
    icon: <TrophyOutlined />,
    title: '认证保障',
    description: '严格的项目审核机制，确保平台项目的真实性与质量。',
    gradient: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-500/10',
    accent: 'text-emerald-600',
  },
];

const steps = [
  {
    number: '01',
    icon: <AuditOutlined />,
    title: '注册认证',
    description: '填写项目信息，提交营业执照或学生证明，完成团队认证',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    number: '02',
    icon: <RocketOutlined />,
    title: '发布项目',
    description: '完善项目BP、团队介绍和发展计划，让更多人了解你的项目',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    number: '03',
    icon: <LinkOutlined />,
    title: '对接资源',
    description: '与投资人、导师和产业资源方建立联系，获得发展支持',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    number: '04',
    icon: <SafetyCertificateOutlined />,
    title: '加速成长',
    description: '通过平台背书和资源支持，推动项目快速发展壮大',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
    requestAnimationFrame(() => {
      setIsLoggedIn(isAuthenticated());
    });
    async function fetchProjects() {
      try {
        const res = await projectApi.list({ status: 'online', is_public: 'true' });
        if (res.data) {
          const data = res.data as { items?: Project[] };
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
    <div className="overflow-x-hidden">
      <BannerCarousel />

      {/* ═══════════════════════════════════════════════════════
            Hero Section — 主视觉区域
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] bg-primary-gradient text-white overflow-hidden flex items-center">
        {/* ── 底层纹理 ── */}
        <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        <div className="absolute inset-0 bg-dot-matrix-light opacity-40" />
        <div className="absolute inset-0 bg-hex-pattern opacity-[0.04]" />

        {/* ── 极光渐变 ── */}
        <div className="absolute inset-0 bg-aurora-dark opacity-70" />

        {/* ── 动态变形光斑 ── */}
        <div className="absolute top-[10%] right-[15%] w-[30rem] h-[30rem] bg-amber-400/6 rounded-full blur-[100px] animate-morph-blob" />
        <div className="absolute bottom-[15%] left-[10%] w-[24rem] h-[24rem] bg-blue-400/5 rounded-full blur-[90px] animate-morph-blob-reverse" />
        <div className="absolute top-[50%] left-[40%] w-[20rem] h-[20rem] bg-purple-400/4 rounded-full blur-[80px] animate-morph-blob" style={{ animationDelay: '-5s' }} />

        {/* ── 脉冲光晕 ── */}
        <div className="absolute top-1/4 -right-32 w-[36rem] h-[36rem] bg-amber-400/8 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -left-32 w-[28rem] h-[28rem] bg-blue-400/6 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2.5s' }} />

        {/* ── 浮动装饰点 ── */}
        <div className="floating-dot floating-dot-1 w-1 h-1 bg-amber-300/40 top-[20%] right-[30%]" />
        <div className="floating-dot floating-dot-1 w-1.5 h-1.5 bg-blue-300/30 top-[60%] right-[45%]" style={{ animationDelay: '-3s' }} />
        <div className="floating-dot floating-dot-2 w-1 h-1 bg-white/30 top-[35%] left-[25%]" />
        <div className="floating-dot floating-dot-2 w-2 h-2 bg-amber-300/20 top-[70%] left-[40%]" style={{ animationDelay: '-4s' }} />
        <div className="floating-dot floating-dot-3 w-1 h-1 bg-emerald-300/30 top-[15%] left-[55%]" />
        <div className="floating-dot floating-dot-3 w-1.5 h-1.5 bg-white/20 top-[80%] right-[20%]" style={{ animationDelay: '-2s' }} />

        {/* ── 装饰几何 ── */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04]">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M0 200L66 133L133 200L200 133L200 200Z" fill="url(#lineGrad)" opacity="0.15" />
            <circle cx="166" cy="33" r="2" fill="white" opacity="0.3" />
            <circle cx="33" cy="66" r="1.5" fill="white" opacity="0.2" />
            <circle cx="100" cy="100" r="1" fill="white" opacity="0.15" />
          </svg>
        </div>

        {/* ── 主内容 ── */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="lg:w-[55%] xl:w-1/2">
            {/* 徽章 */}
            <div className={`inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm text-amber-300 mb-8 border border-white/15 shadow-[0_0_20px_rgba(245,158,11,0.1)] ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
              <StarOutlined />
              <span className="font-medium tracking-wide">新一代贝壳创业俱乐部</span>
            </div>

            {/* 主标题 */}
            <h1 className={`text-[2.5rem] sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-6 tracking-tight ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`}>
              让校园创业项目，
              <br />
              <span className="text-gradient-gold relative inline-block">
                被更多人看见
                <span className="absolute -bottom-1.5 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full" />
              </span>
              。
            </h1>

            {/* 副标题 */}
            <p className={`text-lg sm:text-xl text-gray-200/90 leading-relaxed mb-10 max-w-lg ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              面向高校学生创业团队，连接校内创新项目、校外导师、投资人和产业资源，
              打造真实、高效、开放的校园创投生态平台。
            </p>

            {/* CTA 按钮组 */}
            <div className={`flex flex-wrap gap-4 ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <Link
                href="/projects"
                className="group inline-flex items-center px-8 py-4 bg-accent-gradient text-primary font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                浏览创业项目
                <RightOutlined className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/register"
                className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/[0.15] hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                加入我们
                <ArrowRightOutlined className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            {/* 信任标识 */}
            <div className={`flex flex-wrap items-center gap-x-8 gap-y-3 mt-12 text-sm text-white/50 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-emerald-400 text-base" />
                <span>官方认证</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-emerald-400 text-base" />
                <span>免费入驻</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-emerald-400 text-base" />
                <span>数据安全</span>
              </div>
            </div>
          </div>

          {/* 右侧浮动信息卡 */}
          <div className="hidden lg:flex flex-col gap-5 absolute right-4 xl:right-10 top-1/2 -translate-y-1/2 w-[17rem]">
            <div className="glass-card-floating animate-float">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                  <FireOutlined className="text-white text-lg" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-white/60 uppercase tracking-wide font-medium truncate">今日新增项目</div>
                  <div className="text-2xl font-bold mt-0.5">
                    <span className="text-gradient-gold">+3</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card-floating animate-float" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
                  <ThunderboltOutlined className="text-white text-lg" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-white/60 uppercase tracking-wide font-medium truncate">已完成对接</div>
                  <div className="text-2xl font-bold mt-0.5">
                    <span className="text-gradient-gold">26笔</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card-floating animate-float" style={{ animationDelay: '1.2s' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                  <SmileOutlined className="text-white text-lg" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-white/60 uppercase tracking-wide font-medium truncate">活跃导师</div>
                  <div className="text-2xl font-bold mt-0.5">
                    <span className="text-gradient-gold">50+位</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部波浪过渡 → 暖沙色 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto">
            <path d="M0 120L48 108C96 96 192 72 288 64C384 56 480 64 576 70C672 76 768 80 864 78C960 76 1056 68 1152 66C1248 64 1344 68 1392 70L1440 72V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" fill="#f7f3ec" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
            Stats Section — 数据统计
          ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-2 pb-24 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-aurora opacity-50 pointer-events-none" />

        <div className="relative bg-[#fefcf8]/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_40px_rgba(10,42,92,0.06)] px-6 py-10 sm:px-10 sm:py-12 border border-[#e8dfd0]/80 overflow-hidden">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#f7f3ec]/50 via-[#fefcf8] to-[#f7f3ec]/30 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#d9cebb] to-transparent" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 sm:gap-x-10">
            {stats.map((stat, index) => (
              <div key={index} className="group text-center">
                <div className="relative mx-auto mb-5">
                  <div className={`absolute inset-0 rounded-2xl ${stat.bgGlow} blur-xl group-hover:blur-2xl transition-all duration-500 scale-75 group-hover:scale-100`} />
                  <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-2 leading-relaxed">
                  <span className="font-semibold text-gray-700">{stat.label}</span>
                  <span className="mx-1.5 text-gray-300">·</span>
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
            How It Works — 使用流程
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-28 overflow-hidden">
        {/* ── 暖沙色背景层 ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f3ec] via-[#faf7f2] to-[#f7f3ec]" />
        <div className="absolute inset-0 bg-dot-matrix opacity-60" />
        {/* 光斑 */}
        <div className="absolute top-1/3 -left-24 w-[28rem] h-[28rem] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 -right-24 w-[24rem] h-[24rem] bg-amber-100/30 rounded-full blur-[100px] pointer-events-none" />
        {/* 浮动点 */}
        <div className="floating-dot floating-dot-1 w-1.5 h-1.5 bg-blue-300/40 top-[25%] left-[10%]" />
        <div className="floating-dot floating-dot-2 w-1 h-1 bg-amber-300/30 top-[60%] right-[15%]" />
        <div className="floating-dot floating-dot-3 w-2 h-2 bg-purple-300/20 top-[40%] right-[8%]" style={{ animationDelay: '-3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <span className="inline-block px-4 py-1.5 bg-primary/5 text-primary/70 text-sm font-medium rounded-full mb-4 tracking-wide">
              快速开始
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-4 tracking-tight">
              简单四步，开启创业之旅
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              快速入驻贝壳青创汇，让您的项目获得更多曝光与资源支持
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
            {/* 桌面端连接线 */}
            <div className="hidden lg:flex absolute top-14 left-[12.5%] right-[12.5%] items-center">
              <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 relative">
                <div className="absolute -top-[3px] left-1/4 -translate-x-1/2 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                <div className="absolute -top-[3px] left-2/4 -translate-x-1/2 w-2.5 h-2.5 bg-purple-400 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
                <div className="absolute -top-[3px] left-3/4 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              </div>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="relative bg-[#fefcf8] rounded-2xl px-6 pt-14 pb-7 shadow-[0_2px_12px_rgba(10,42,92,0.03)] hover:shadow-[0_12px_32px_rgba(10,42,92,0.08)] transition-all duration-500 hover:-translate-y-1.5 border border-[#e8dfd0] h-full">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white text-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      {step.icon}
                    </div>
                  </div>
                  <div className="text-center mb-3">
                    <span className="text-xs font-bold tracking-[0.2em] text-gray-300 uppercase">Step {step.number}</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary text-center mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed text-center max-w-[15rem] mx-auto">
                    {step.description}
                  </p>
                  <div className={`mt-5 w-12 h-1 mx-auto rounded-full bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-100 group-hover:w-16 transition-all duration-500`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
            Features Section — 平台特色
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-28 overflow-hidden">
        {/* ── 暖色调背景层 ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf7f2] via-[#f5f0e8]/50 to-[#faf7f2]" />
        <div className="absolute inset-0 bg-hex-pattern opacity-40" />
        {/* 动态光斑 */}
        <div className="absolute top-0 right-0 w-[42rem] h-[42rem] bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none animate-morph-blob" />
        <div className="absolute bottom-0 left-0 w-[36rem] h-[36rem] bg-amber-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none animate-morph-blob-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] bg-purple-100/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        {/* 浮动点 */}
        <div className="floating-dot floating-dot-1 w-1.5 h-1.5 bg-blue-400/30 top-[15%] right-[25%]" />
        <div className="floating-dot floating-dot-2 w-1 h-1 bg-amber-400/25 bottom-[20%] left-[20%]" />
        <div className="floating-dot floating-dot-3 w-2 h-2 bg-emerald-400/20 top-[50%] right-[12%]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4 tracking-wide">
              核心优势
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-4 tracking-tight">
              为什么选择贝壳青创汇
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              专为校园创业者打造的一站式创业服务平台，连接资源，助力成长
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-[#fefcf8]/90 backdrop-blur-sm rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(10,42,92,0.03)] hover:shadow-[0_16px_40px_rgba(10,42,92,0.08)] transition-all duration-500 hover:-translate-y-2 border border-[#e8dfd0] overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                <div className={`absolute -top-8 -right-8 w-24 h-24 ${feature.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  <div className={`w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white text-xl mb-5 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-3 group-hover:text-primary-light transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
            Featured Projects — 精选项目展示
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-28 overflow-hidden">
        {/* ── 暖沙色背景层 ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f3ec]/80 via-[#faf7f2] to-[#f7f3ec]/80" />
        <div className="absolute inset-0 bg-grid-diagonal opacity-50" />
        <div className="absolute inset-0 bg-aurora-animated opacity-40" />
        {/* 光斑 */}
        <div className="absolute top-0 left-0 w-[30rem] h-[30rem] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[24rem] h-[24rem] bg-amber-100/30 rounded-full blur-[100px] pointer-events-none translate-x-1/4 translate-y-1/4" />
        {/* 浮动点 */}
        <div className="floating-dot floating-dot-1 w-1 h-1 bg-blue-400/25 top-[10%] right-[30%]" />
        <div className="floating-dot floating-dot-2 w-1.5 h-1.5 bg-amber-400/20 bottom-[15%] left-[25%]" style={{ animationDelay: '-2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-5">
            <div>
              <span className="inline-block px-4 py-1.5 bg-blue-100/80 text-blue-600 text-sm font-medium rounded-full mb-4 tracking-wide">
                项目展示
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mb-2">
                精选校园创业项目
              </h2>
              <p className="text-gray-500 text-base sm:text-lg">发现来自校园的创新力量</p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors group self-start sm:self-end flex-shrink-0"
            >
              查看全部项目
              <span className="w-8 h-8 rounded-full bg-primary/5 group-hover:bg-accent/10 flex items-center justify-center transition-all duration-300">
                <ArrowRightOutlined className="text-sm group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-accent/30 animate-spin" style={{ animationDuration: '1.5s' }} />
              </div>
              <p className="text-gray-400 text-sm animate-pulse mt-2">正在加载精选项目...</p>
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group bg-[#fefcf8]/90 backdrop-blur-sm rounded-2xl shadow-[0_2px_12px_rgba(10,42,92,0.03)] hover:shadow-[0_16px_40px_rgba(10,42,92,0.08)] transition-all duration-500 overflow-hidden border border-[#e8dfd0] hover:-translate-y-2 flex flex-col"
                >
                  <div className="relative h-40 bg-gradient-to-br from-[#f5f0e8] to-[#efe8dc] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {project.cover_image ? (
                      <>
                        <img
                          src={project.cover_image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-[#f7f3ec] flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                          <RocketOutlined className="text-3xl text-primary/20 group-hover:text-primary/35 group-hover:scale-110 transition-all duration-300" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1.5 bg-accent-gradient text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                        种子计划
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-primary group-hover:text-primary-light transition-colors duration-300 mb-2 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags?.split(',').slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#f5f0e8] text-gray-500 rounded-lg text-xs font-medium group-hover:bg-[#efe8dc] transition-colors duration-300">
                          {tag.trim()}
                        </span>
                      ))}
                      {project.team && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">
                          <CheckCircleOutlined className="text-[10px]" />
                          已认证
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 sm:py-24 bg-[#fefcf8]/90 backdrop-blur-sm rounded-3xl border border-dashed border-[#d9cebb]">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#f5f0e8] flex items-center justify-center">
                <RocketOutlined className="text-3xl text-[#d9cebb]" />
              </div>
              <p className="text-gray-400 text-lg font-medium">暂无精选项目</p>
              <p className="text-gray-300 text-sm mt-1.5">精彩项目即将上线，敬请期待</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
            CTA Section — 行动号召
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-28 sm:py-32 bg-primary-gradient overflow-hidden">
        {/* ── 底层纹理 ── */}
        <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        <div className="absolute inset-0 bg-dot-matrix-light opacity-30" />
        <div className="absolute inset-0 bg-hex-pattern opacity-[0.03]" />

        {/* ── 极光 ── */}
        <div className="absolute inset-0 bg-aurora-dark opacity-60" />

        {/* ── 动态变形光斑 ── */}
        <div className="absolute top-0 right-1/4 w-[36rem] h-[36rem] bg-amber-400/6 rounded-full blur-[150px] animate-morph-blob" />
        <div className="absolute bottom-0 left-1/4 w-[28rem] h-[28rem] bg-blue-400/5 rounded-full blur-[120px] animate-morph-blob-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] bg-purple-400/3 rounded-full blur-[100px] animate-pulse-slow" />

        {/* ── 浮动装饰点 ── */}
        <div className="floating-dot floating-dot-1 w-1 h-1 bg-amber-300/30 top-[15%] right-[20%]" />
        <div className="floating-dot floating-dot-2 w-1.5 h-1.5 bg-white/20 top-[70%] left-[15%]" />
        <div className="floating-dot floating-dot-3 w-1 h-1 bg-blue-300/25 top-[40%] right-[35%]" style={{ animationDelay: '-3s' }} />
        <div className="floating-dot floating-dot-2 w-2 h-2 bg-white/15 top-[25%] left-[35%]" style={{ animationDelay: '-1s' }} />
        <div className="floating-dot floating-dot-1 w-1 h-1 bg-emerald-300/25 bottom-[20%] right-[25%]" style={{ animationDelay: '-5s' }} />

        {/* ── 装饰几何 ── */}
        <div className="absolute top-10 left-10 opacity-[0.03]">
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="40" height="40" rx="8" fill="white" />
            <rect x="45" y="0" width="40" height="40" rx="8" fill="white" />
            <rect x="0" y="45" width="40" height="40" rx="8" fill="white" />
          </svg>
        </div>
        <div className="absolute bottom-10 right-10 opacity-[0.03]">
          <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" fill="white" />
            <circle cx="60" cy="20" r="16" fill="white" />
            <circle cx="40" cy="60" r="16" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight leading-[1.15]">
            从一个想法，
            <br className="sm:hidden" />
            <span className="text-gradient-gold">到一个真正的创业项目</span>
          </h2>

          <p className="text-gray-200/80 text-base sm:text-lg mb-12 leading-relaxed max-w-xl mx-auto">
            在这里，同学可以发现项目，团队可以发布项目，导师可以辅导项目，
            投资人可以发现项目，资源方可以支持项目。
            <br className="hidden sm:block" />
            贝壳创业俱乐部，陪伴校园创业团队从种子阶段走向更大的舞台。
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link
              href={isLoggedIn ? '/dashboard' : '/register'}
              className="group inline-flex items-center px-10 py-4 bg-accent-gradient text-primary font-bold rounded-xl hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoggedIn ? '马上行动' : '立即加入'}
              <ArrowRightOutlined className="ml-2.5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center px-10 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/[0.15] hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              了解更多
              <ArrowRightOutlined className="ml-2.5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <SafetyCertificateOutlined className="text-emerald-400/60" />
              <span>官方认证平台</span>
            </div>
            <div className="w-1 h-1 bg-white/20 rounded-full hidden sm:block" />
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-blue-400/60" />
              <span>100+ 活跃团队</span>
            </div>
            <div className="w-1 h-1 bg-white/20 rounded-full hidden sm:block" />
            <div className="flex items-center gap-2">
              <FundOutlined className="text-amber-400/60" />
              <span>20+ 合作机构</span>
            </div>
          </div>
        </div>

        {/* 顶部波浪过渡（从暖沙到深蓝） */}
        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto">
            <path d="M0 80L48 68C96 56 192 32 288 26C384 20 480 32 576 38C672 44 768 44 864 40C960 36 1056 28 1152 24C1248 20 1344 20 1392 20L1440 20V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="#f7f3ec" opacity="0.5" />
          </svg>
        </div>
      </section>
    </div>
  );
}
