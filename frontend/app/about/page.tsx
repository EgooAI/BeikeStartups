'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth';
import {
  RocketOutlined,
  TeamOutlined,
  FundOutlined,
  ExperimentOutlined,
  BuildOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  HeartOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CodeOutlined,
  StarOutlined,
  FireOutlined,
  CheckCircleOutlined,
  ApiOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';

const values = [
  { icon: <BulbOutlined />, title: '创新驱动', desc: '鼓励校园创新，支持每一个有价值的想法从0到1', accent: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { icon: <HeartOutlined />, title: '真实可信', desc: '严格认证机制，确保平台项目信息真实可靠', accent: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  { icon: <TeamOutlined />, title: '开放协作', desc: '连接多方资源，构建开放高效的创投协作生态', accent: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
  { icon: <SafetyOutlined />, title: '持续成长', desc: '全周期孵化陪伴，从种子阶段走向更大的舞台', accent: '#10b981', glow: 'rgba(16,185,129,0.3)' },
];

const offerings = [
  { title: '项目展示', desc: '为认证团队提供专业项目展示页面', icon: <RocketOutlined /> },
  { title: '团队招募', desc: '帮助团队高效招募志同道合的伙伴', icon: <TeamOutlined /> },
  { title: '创业认证', desc: '为真实创业团队提供官方身份认证', icon: <CheckCircleOutlined /> },
  { title: '导师辅导', desc: '对接校外导师提供专业指导与建议', icon: <ExperimentOutlined /> },
  { title: '投资对接', desc: '连接投资机构与优质校园创业项目', icon: <FundOutlined /> },
  { title: '资源合作', desc: '精准匹配产业资源与创业团队需求', icon: <BuildOutlined /> },
  { title: '活动路演', desc: '定期举办创业路演和训练营活动', icon: <FireOutlined /> },
  { title: '种子孵化', desc: '为早期项目提供全方位孵化支持', icon: <StarOutlined /> },
];

const stats = [
  { value: '128+', label: '入驻项目', icon: <RocketOutlined /> },
  { value: '36+', label: '认证团队', icon: <TeamOutlined /> },
  { value: '50+', label: '导师资源', icon: <ExperimentOutlined /> },
  { value: '20+', label: '投资机构', icon: <FundOutlined /> },
];

export default function AboutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return (
    <div className="min-h-screen bg-[#060b14] text-white overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════
            Hero — 主视觉
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* 深空背景 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,42,92,0.4),transparent_70%)]" />

        {/* 动态网格 */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }} />

        {/* 扫描线效果 */}
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59,130,246,0.015) 2px, rgba(59,130,246,0.015) 4px)',
          pointerEvents: 'none',
        }} />

        {/* 发光球体 */}
        <div className="absolute top-1/4 -left-32 w-[30rem] h-[30rem] bg-blue-500/8 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-[26rem] h-[26rem] bg-amber-500/6 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] bg-purple-500/5 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '4s' }} />

        {/* 浮动粒子 */}
        <div className="floating-dot floating-dot-1 w-1 h-1 bg-blue-400/60 top-[15%] left-[20%]" />
        <div className="floating-dot floating-dot-2 w-1.5 h-1.5 bg-amber-400/40 top-[70%] right-[25%]" />
        <div className="floating-dot floating-dot-3 w-1 h-1 bg-purple-400/50 top-[30%] right-[15%]" />
        <div className="floating-dot floating-dot-1 w-1 h-1 bg-blue-300/40 top-[80%] left-[30%]" style={{ animationDelay: '-3s' }} />
        <div className="floating-dot floating-dot-2 w-2 h-2 bg-amber-300/25 top-[45%] left-[60%]" style={{ animationDelay: '-4s' }} />
        <div className="floating-dot floating-dot-3 w-1 h-1 bg-emerald-400/40 bottom-[10%] left-[50%]" style={{ animationDelay: '-5s' }} />

        {/* 装饰电路线 */}
        <svg className="absolute top-10 right-10 opacity-[0.06] w-48 h-48" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path d="M10 100 L60 100 L80 80 L120 80 L140 100 L190 100" stroke="url(#circuitGrad)" strokeWidth="1.5" fill="none" />
          <path d="M60 100 L60 140 L80 160 L140 160 L160 140 L190 140" stroke="url(#circuitGrad)" strokeWidth="1.5" fill="none" />
          <circle cx="10" cy="100" r="3" fill="#3b82f6" />
          <circle cx="60" cy="100" r="2" fill="#3b82f6" />
          <circle cx="80" cy="80" r="1.5" fill="#f59e0b" />
          <circle cx="190" cy="100" r="3" fill="#f59e0b" />
          <circle cx="190" cy="140" r="2" fill="#f59e0b" />
        </svg>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* 标签 */}
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-sm text-amber-400 mb-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <ThunderboltOutlined />
            BEIKE STARTUP CLUB
          </div>

          {/* 主标题 */}
          <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tighter ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              贝壳创业
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              俱乐部
            </span>
          </h1>

          {/* 副标题 */}
          <p className={`text-lg sm:text-xl text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            让校园创业项目，
            <span className="text-white font-semibold">被更多人看见</span>
            。连接创新、资源与未来。
          </p>

          {/* 数据条 */}
          <div className={`flex flex-wrap justify-center gap-6 sm:gap-10 mb-12 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 mt-1 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className={`${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <Link
              href={isLoggedIn ? '/dashboard' : '/register'}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-[#060b14] font-bold rounded-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 hover:-translate-y-0.5"
            >
              {isLoggedIn ? '马上行动' : '立即加入'}
              <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 底部渐变过渡 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060b14] to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════
            Mission — 使命
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-28">
        {/* 背景光线 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 text-sm font-medium rounded-full mb-4 border border-blue-500/20">
              <RadarChartOutlined />
              OUR MISSION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                我们的使命
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
              贝壳创业俱乐部致力于打造高校创新创业项目展示与资源匹配平台。
              我们汇聚校内优秀创业团队，连接校外导师、投资人、产业资源方与学生创客，
              让每一个有价值的想法都能获得展示、交流和成长的机会。
            </p>
          </div>

          {/* 核心价值卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <div
                key={i}
                className="group relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
              >
                {/* 顶部发光线 */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${v.accent}, transparent)` }}
                />
                {/* 背景光晕 */}
                <div
                  className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: v.glow }}
                />

                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${v.accent}15, ${v.accent}25)`,
                      color: v.accent,
                      boxShadow: `0 0 20px ${v.glow}`,
                    }}
                  >
                    {v.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
            Problem & Solution — 问题与方案
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-28">
        <div className="absolute inset-0 bg-white/[0.015]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 问题 */}
            <div className="relative group rounded-2xl p-8 border border-red-500/10 bg-red-500/[0.02] hover:border-red-500/20 transition-all duration-500">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-5">
                <ApiOutlined className="text-red-400 text-lg" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">当前困境</h3>
              <p className="text-gray-400 leading-relaxed">
                很多校园创业项目拥有不错的创意和执行力，却缺少被看见的机会；
                很多投资人、导师和企业资源方愿意支持年轻团队，却很难系统地了解校内项目。
                <br /><br />
                信息不对称、渠道分散、认证困难——这些是校园创投生态长期面临的挑战。
              </p>
            </div>

            {/* 方案 */}
            <div className="relative group rounded-2xl p-8 border border-emerald-500/10 bg-emerald-500/[0.02] hover:border-emerald-500/20 transition-all duration-500">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <GlobalOutlined className="text-emerald-400 text-lg" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">我们的方案</h3>
              <p className="text-gray-400 leading-relaxed">
                贝壳创业俱乐部希望成为连接双方的桥梁。我们提供统一的认证展示平台，
                让项目信息更清晰，让资源对接更高效，让校园创业氛围更真实、更持续。
                <br /><br />
                通过严格审核 + 智能匹配 + 全周期服务，构建可信赖的校园创投生态。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
            Offerings — 服务能力
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-28">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 text-sm font-medium rounded-full mb-4 border border-amber-500/20">
              <CodeOutlined />
              CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                平台能力
              </span>
            </h2>
            <p className="text-gray-500 text-lg">八大核心服务，全面覆盖校园创业全周期</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {offerings.map((item, i) => (
              <div
                key={i}
                className="group relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/10 transition-colors duration-300"
                    style={{ color: `var(--accent-${i % 4})` }}
                  >
                    <span className="text-amber-400 group-hover:scale-110 transition-transform duration-300 text-sm">
                      {item.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
            CTA — 行动号召
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-28 sm:py-32 overflow-hidden">
        {/* 动态背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060b14] via-[#0a1830] to-[#060b14]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />

        {/* 中央光晕 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-blue-500/6 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/3 w-[20rem] h-[20rem] bg-amber-500/4 rounded-full blur-[100px] animate-pulse-slow" />

        {/* 浮动粒子 */}
        <div className="floating-dot floating-dot-1 w-1 h-1 bg-blue-400/50 top-[20%] left-[15%]" />
        <div className="floating-dot floating-dot-2 w-1 h-1 bg-amber-400/40 bottom-[25%] right-[20%]" />
        <div className="floating-dot floating-dot-3 w-1.5 h-1.5 bg-purple-400/30 top-[60%] right-[10%]" />
        <div className="floating-dot floating-dot-1 w-1 h-1 bg-white/30 top-[40%] left-[70%]" style={{ animationDelay: '-3s' }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 装饰标签 */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-sm text-amber-400 mb-8">
            <StarOutlined />
            JOIN THE MOVEMENT
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              从一个想法，
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              到一个真正的创业项目
            </span>
          </h2>

          <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            贝壳创业俱乐部，陪伴校园创业团队
            <br />
            从种子阶段走向更大的舞台。
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={isLoggedIn ? '/dashboard' : '/register'}
              className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-[#060b14] font-bold rounded-xl hover:shadow-[0_0_40px_rgba(245,158,11,0.35)] transition-all duration-300 hover:-translate-y-0.5"
            >
              {isLoggedIn ? '马上行动' : '立即加入'}
              <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 px-10 py-4 bg-white/5 backdrop-blur-md text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-0.5"
            >
              浏览项目
              <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
