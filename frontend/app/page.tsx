'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import { isAuthenticated } from '@/lib/auth';
import BannerCarousel from '@/components/Common/BannerCarousel';
import {
  RocketOutlined,
  TeamOutlined,
  UserOutlined,
  FundOutlined,
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
  PlayCircleOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';

// ── 预生成数据 ──────────────────────────────────

const heroStars = Array.from({ length: 80 }, () => ({
  w: Math.random() * 3 + 1, h: Math.random() * 3 + 1,
  top: Math.random() * 100, left: Math.random() * 100,
  color: ['#00f0ff', '#ffb800', '#b347ea', '#ffffff'][Math.floor(Math.random() * 4)],
  opacity: Math.random() * 0.6 + 0.2, duration: Math.random() * 8 + 6, delay: Math.random() * 8,
}));
const globalStars = Array.from({ length: 120 }, () => ({
  w: Math.random() * 2 + 0.5, h: Math.random() * 2 + 0.5,
  top: Math.random() * 100, left: Math.random() * 100,
  color: ['#00f0ff', '#ffb800', '#b347ea', '#ffffff', '#00ff88'][Math.floor(Math.random() * 5)],
  opacity: Math.random() * 0.35 + 0.08, duration: Math.random() * 12 + 8, delay: Math.random() * 12,
}));
const floatingParticles = Array.from({ length: 20 }, () => ({
  w: Math.random() * 2 + 1, h: Math.random() * 2 + 1,
  top: Math.random() * 100, left: Math.random() * 100,
  opacity: Math.random() * 0.5 + 0.2, duration: Math.random() * 6 + 4, delay: Math.random() * 4,
}));

const stats = [
  { value: '128+', label: '入驻项目', icon: <RocketOutlined />, neon: 'cyan' },
  { value: '36+', label: '认证团队', icon: <TeamOutlined />, neon: 'amber' },
  { value: '50+', label: '导师资源', icon: <UserOutlined />, neon: 'purple' },
  { value: '20+', label: '投资机构', icon: <FundOutlined />, neon: 'green' },
];
const neonC = (k: string) => ({
  cyan: { t: 'text-[#00f0ff]', b: 'border-[#00f0ff]/25', g: 'shadow-[0_0_25px_rgba(0,240,255,0.12)]', bg: 'bg-[#00f0ff]/8', f: 'from-[#00f0ff]' },
  amber: { t: 'text-[#ffb800]', b: 'border-[#ffb800]/25', g: 'shadow-[0_0_25px_rgba(255,184,0,0.12)]', bg: 'bg-[#ffb800]/8', f: 'from-[#ffb800]' },
  purple: { t: 'text-[#b347ea]', b: 'border-[#b347ea]/25', g: 'shadow-[0_0_25px_rgba(179,71,234,0.12)]', bg: 'bg-[#b347ea]/8', f: 'from-[#b347ea]' },
  green: { t: 'text-[#00ff88]', b: 'border-[#00ff88]/25', g: 'shadow-[0_0_25px_rgba(0,255,136,0.12)]', bg: 'bg-[#00ff88]/8', f: 'from-[#00ff88]' },
}[k]!);

const features = [
  { icon: <BulbOutlined />, title: '发现优质项目', desc: '汇聚校园内经过认证的创业项目，发现下一批值得期待的年轻创业团队。', neon: 'cyan' },
  { icon: <TagOutlined />, title: '精准资源匹配', desc: '智能匹配投资人、导师与项目，实现高效的投融资对接与辅导。', neon: 'amber' },
  { icon: <RiseOutlined />, title: '全周期孵化', desc: '从种子期到成熟期，陪伴创业项目成长的每一个阶段。', neon: 'purple' },
  { icon: <TrophyOutlined />, title: '认证保障', desc: '严格的项目审核机制，确保平台项目的真实性与质量。', neon: 'green' },
];
const steps = [
  { num: '01', icon: <AuditOutlined />, title: '注册认证', desc: '填写项目信息，提交营业执照或学生证明，完成团队认证', neon: 'cyan' },
  { num: '02', icon: <RocketOutlined />, title: '发布项目', desc: '完善项目BP、团队介绍和发展计划，让更多人了解你的项目', neon: 'amber' },
  { num: '03', icon: <LinkOutlined />, title: '对接资源', desc: '与投资人、导师和产业资源方建立联系，获得发展支持', neon: 'purple' },
  { num: '04', icon: <SafetyCertificateOutlined />, title: '加速成长', desc: '通过平台背书和资源支持，推动项目快速发展壮大', neon: 'green' },
];

// ── 粒子物理系统 (Canvas) ──────────────────────

interface Particle {
  x: number; y: number; vx: number; vy: number;
  ox: number; oy: number; // 初始位置
  r: number; color: string; alpha: number;
}

function createParticles(canvas: HTMLCanvasElement, count: number) {
  const ctx = canvas.getContext('2d')!;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;

  const particles: Particle[] = [];
  const colors = ['#00f0ff', '#b347ea', '#ffb800', '#00ff88'];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    particles.push({
      x, y, ox: x, oy: y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.5 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.3,
    });
  }

  const mouse = { x: -1000, y: -1000 };
  const REPEL_RADIUS = 180;
  const REPEL_FORCE = 2.5;
  const RETURN_FORCE = 0.015;
  const CONNECT_DIST = 120;

  function animate() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // 鼠标排斥
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_RADIUS && dist > 1) {
        const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_FORCE;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // 回归初始位置
      p.vx += (p.ox - p.x) * RETURN_FORCE;
      p.vy += (p.oy - p.y) * RETURN_FORCE;

      // 阻尼
      p.vx *= 0.96;
      p.vy *= 0.96;

      // 移动
      p.x += p.vx;
      p.y += p.vy;

      // 边界
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    }

    // 绘制连线
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // 绘制粒子
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(animate);
  }

  return {
    particles,
    animate,
    get mouse() { return mouse; },
    set mouse(pos: { x: number; y: number }) { mouse.x = pos.x; mouse.y = pos.y; },
  };
}

// ── 主组件 ──────────────────────────────────────

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const trailLen = 24;
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>(() => Array.from({ length: trailLen }, (_, i) => ({ x: -100, y: -100, id: i })));
  const [trailSeq, setTrailSeq] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [cursorPixel, setCursorPixel] = useState({ x: -100, y: -100 });
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const rippleRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 移动端检测
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 平台核心卡片定时轮播
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % 4), 3000);
    return () => clearInterval(t);
  }, []);

  // 粒子物理画布 (仅桌面端)
  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const system = createParticles(canvas, 100);
    system.animate();
    const updateMouse = (e: MouseEvent) => {
      system.mouse = { x: e.clientX, y: e.clientY };
    };
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('resize', resize);
    };
  }, [isMobile]);

  // 光标与卡片交互 — 3D倾斜
  const handleCardTilt = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const el = e.currentTarget as HTMLElement;
    el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(4px)`;
    const glow = el.querySelector('.tilt-glow') as HTMLElement;
    if (glow) glow.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(0,240,255,0.08) 0%, transparent 60%)`;
  };
  const handleCardLeave = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0)';
    const glow = el.querySelector('.tilt-glow') as HTMLElement;
    if (glow) glow.style.background = 'transparent';
  };

  // 点击涟漪
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const id = ++rippleRef.current;
      setRipples(p => [...p.slice(-8), { x: e.clientX, y: e.clientY, id }]);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => setIsLoaded(true)); requestAnimationFrame(() => setIsLoggedIn(isAuthenticated()));
    (async () => { try { const r = await projectApi.list({ status: 'online', is_public: 'true' }); if (r.data) { const d = r.data as { items?: Project[] }; setFeaturedProjects(d.items?.slice(0, 4) || []); } } catch (e) { console.error(e) } finally { setLoading(false); } })();
  }, []);

  // 光标跟踪 (仅桌面端)
  useEffect(() => {
    if (isMobile) return;
    let seq = 0;
    const mm = (e: MouseEvent) => { const pp = { x: e.clientX, y: e.clientY }; const rp = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }; setMousePos(rp); setCursorPixel(pp); seq += 1; const id = seq; setTrailSeq(id); setTrail(p => { const n = [...p]; n[id % trailLen] = { ...pp, id }; return n; }); };
    const sm = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', mm); window.addEventListener('scroll', sm, { passive: true });
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('scroll', sm); };
  }, [isMobile]);

  return (
    <div className="overflow-x-hidden bg-[#050510] relative">
      {/* ── 全局星空 ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {globalStars.map((p, i) => (<div key={i} className="absolute rounded-full" style={{ width: `${p.w}px`, height: `${p.h}px`, top: `${p.top}%`, left: `${p.left}%`, backgroundColor: p.color, opacity: p.opacity, animation: `star-drift ${p.duration}s linear infinite`, animationDelay: `${p.delay}s` }} />))}
      </div>

      <div className="relative z-[1]">
        {!isMobile && <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[2]" />}
        {/* ════════════════════════════════════════════
              HERO
           ════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050510]">
          {/* 鼠标光晕 */}
          <div className="absolute pointer-events-none w-[50rem] h-[50rem] rounded-full blur-[180px] transition-[left,top] duration-[2s] ease-out" style={{ left: `${mousePos.x * 100}%`, top: `${mousePos.y * 100}%`, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle,rgba(0,240,255,0.05) 0%,transparent 70%)' }} />
          <div className="absolute pointer-events-none w-[30rem] h-[30rem] rounded-full blur-[120px] transition-[left,top] duration-[1.5s] ease-out" style={{ left: `${(1 - mousePos.x) * 100}%`, top: `${(1 - mousePos.y) * 100}%`, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle,rgba(179,71,234,0.04) 0%,transparent 70%)' }} />

          {/* 视差星空 */}
          <div className="absolute inset-0" style={{ transform: `translate(${(mousePos.x - 0.5) * -20}px,${(mousePos.y - 0.5) * -20}px)`, transition: 'transform 1.5s ease-out' }}>
            {heroStars.map((p, i) => (<div key={i} className="absolute rounded-full" style={{ width: `${p.w}px`, height: `${p.h}px`, top: `${p.top}%`, left: `${p.left}%`, backgroundColor: p.color, opacity: p.opacity, animation: `star-drift ${p.duration}s linear infinite`, animationDelay: `${p.delay}s` }} />))}
          </div>

          {/* 大型六边形装饰 */}
          <div className="absolute -right-40 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]" style={{ transform: `translateX(${(mousePos.x - 0.5) * 20}px)` }}>
            <svg width="600" height="700" viewBox="0 0 600 700"><defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00f0ff" /><stop offset="100%" stopColor="#b347ea" /></linearGradient></defs>
              <polygon points="300,20 560,170 560,470 300,620 40,470 40,170" fill="none" stroke="url(#hg)" strokeWidth="1" opacity="0.5" />
              <polygon points="300,80 500,200 500,440 300,560 100,440 100,200" fill="none" stroke="url(#hg)" strokeWidth="0.5" opacity="0.3" />
              <polygon points="300,140 440,220 440,420 300,500 160,420 160,220" fill="none" stroke="url(#hg)" strokeWidth="0.5" opacity="0.15" />
              <circle cx="300" cy="130" r="3" fill="#00f0ff" opacity="0.4" /><circle cx="440" cy="220" r="2" fill="#00f0ff" opacity="0.3" />
              <circle cx="300" cy="510" r="2" fill="#b347ea" opacity="0.3" /><circle cx="160" cy="220" r="2.5" fill="#ffb800" opacity="0.3" />
            </svg>
          </div>

          {/* 网格地面 */}
          <div className="absolute bottom-0 left-0 right-0 h-[45vh] pointer-events-none transition-transform duration-[2s] ease-out" style={{ background: 'linear-gradient(to top, rgba(0,240,255,0.03) 0%, transparent 100%), repeating-linear-gradient(90deg, rgba(0,240,255,0.04) 0px, transparent 1px, transparent 80px, rgba(0,240,255,0.04) 81px), repeating-linear-gradient(0deg, rgba(0,240,255,0.04) 0px, transparent 1px, transparent 40px, rgba(0,240,255,0.04) 41px)', transform: `perspective(500px) rotateX(${60 + (mousePos.y - 0.5) * 8}deg) rotateZ(${(mousePos.x - 0.5) * -3}deg)`, transformOrigin: 'bottom' }} />

          {/* 跟随光标的几何体 */}
          <div className="absolute pointer-events-none z-0 transition-all duration-[3s] ease-out" style={{ left: `${30 + mousePos.x * 40}%`, top: `${20 + mousePos.y * 40}%`, transform: 'translate(-50%,-50%) rotate(45deg)' }}>
            <div className="w-32 h-32 border border-[#00f0ff]/8 rounded-2xl animate-[hex-rotate_20s_linear_infinite]" />
            <div className="absolute inset-4 border border-[#b347ea]/6 rounded-xl animate-[hex-rotate_15s_linear_infinite_reverse]" />
            <div className="absolute inset-8 border border-[#ffb800]/4 rounded-lg" />
          </div>

          {/* 漂移光球 */}
          <div className="absolute w-[600px] h-[600px] bg-[#00f0ff]/3 rounded-full blur-[150px] animate-pulse-slow pointer-events-none transition-[left,top] duration-[3s]" style={{ left: `${40 + mousePos.x * 20}%`, top: `${15 + mousePos.y * 20}%` }} />
          <div className="absolute w-[400px] h-[400px] bg-[#b347ea]/3 rounded-full blur-[120px] animate-pulse-slow pointer-events-none transition-[left,top] duration-[2.5s]" style={{ left: `${50 - mousePos.x * 20}%`, top: `${60 - mousePos.y * 20}%`, animationDelay: '1.5s' }} />

          {/* 主内容 */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
            <div className="lg:w-[60%]">
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] backdrop-blur-md rounded-full border border-[#00f0ff]/20 text-sm text-[#00f0ff] mb-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f0ff]" /></span>
                <span className="tracking-[0.3em] uppercase text-xs font-bold">SYSTEM ONLINE</span>
              </div>
              <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[0.92] ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`}>
                <span className="text-white">让校园</span><br />
                <span className="bg-gradient-to-r from-[#00f0ff] via-[#b347ea] to-[#ffb800] bg-clip-text text-transparent">创业项目</span><br />
                <span className="text-white">被更多人<span className="text-[#00f0ff] text-neon-cyan">看见</span></span>
              </h1>
              <p className={`text-lg sm:text-xl text-gray-400 max-w-lg mb-10 leading-relaxed font-light tracking-wide ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                面向高校学生创业团队，连接校内创新项目、校外导师、投资人和产业资源，打造真实、高效、开放的校园创投生态平台。
              </p>
              <div className={`flex flex-wrap gap-4 ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                <Link href="/projects" className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,240,255,0.4)]"><span className="relative z-10 flex items-center gap-2"><PlayCircleOutlined />探索项目<CaretRightOutlined className="group-hover:translate-x-1 transition-transform" /></span></Link>
                <Link href="/register" className="group relative inline-flex items-center px-8 py-4 bg-transparent text-white font-bold rounded-xl border border-[#00f0ff]/30 hover:border-[#00f0ff]/60 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]"><span className="relative z-10 flex items-center gap-2">加入我们<ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" /></span></Link>
              </div>
              <div className={`flex flex-wrap items-center gap-x-8 gap-y-3 mt-12 text-sm text-gray-500 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                {['官方认证', '免费入驻', '数据安全'].map(t => (<div key={t} className="flex items-center gap-2"><CheckCircleOutlined className="text-[#00ff88]" /><span>{t}</span></div>))}
              </div>
            </div>

            {/* 浮动卡片 — 参差偏移 */}
            <div className="hidden lg:flex flex-col gap-4 absolute right-0 top-1/2 -translate-y-1/2 w-[18rem] transition-transform duration-[2s] ease-out" style={{ transform: `translate(${(mousePos.x - 0.5) * -30}px,${(mousePos.y - 0.5) * -20}px)` }}>
              {[{ icon: <FireOutlined />, label: '今日新增项目', value: '+3', n: 'cyan', offset: '-translate-x-4' }, { icon: <ThunderboltOutlined />, label: '已完成对接', value: '26笔', n: 'amber', offset: 'translate-x-2' }, { icon: <SmileOutlined />, label: '活跃导师', value: '50+位', n: 'purple', offset: '-translate-x-2' }].map((c, i) => { const nc = neonC(c.n); return (<div key={i} className={`holo-card p-5 animate-float ${nc.g} ${c.offset} overflow-hidden`} style={{ animationDelay: `${i * 0.5}s`, transition: 'transform 0.1s ease-out', willChange: 'transform' }} onMouseMove={handleCardTilt} onMouseLeave={handleCardLeave}><div className="tilt-glow absolute inset-0 pointer-events-none transition-none" /><div className="relative z-[1] flex items-center gap-4"><div className={`w-10 h-10 rounded-xl ${nc.bg} ${nc.b} border flex items-center justify-center ${nc.t}`}>{c.icon}</div><div><div className="text-xs text-gray-500 uppercase tracking-wider">{c.label}</div><div className={`text-xl font-black ${nc.t}`}>{c.value}</div></div></div><div className="energy-bar mt-3 relative z-[1]"><div className="energy-bar-fill" style={{ width: `${85 - i * 15}%` }} /></div></div>); })}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a1a] to-transparent pointer-events-none" />
        </section>

        <BannerCarousel />

        {/* ════════════════════════════════════════════
              STATS — 斜面过渡 + 浮动数据卡
           ════════════════════════════════════════════ */}
        <section className="relative pb-28 z-10">
          {/* 斜面切割 */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-[#0a0a1a]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0%)' }} />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, i) => {
                const nc = neonC(s.neon); const yOffsets = ['-translate-y-4', 'translate-y-2', '-translate-y-6', 'translate-y-0']; return (
                  <div key={i} className={`holo-card p-6 sm:p-8 text-center group ${yOffsets[i]}`}>
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${nc.bg} ${nc.b} border ${nc.t} mb-5 group-hover:scale-110 transition-all duration-300 ${nc.g}`}>{s.icon}</div>
                    <div className={`text-3xl sm:text-4xl font-black ${nc.t} mb-1`}>{s.value}</div>
                    <div className="text-sm text-gray-500 font-semibold">{s.label}</div>
                    <div className="energy-bar mt-4"><div className="energy-bar-fill" style={{ width: `${70 + i * 8}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
              HOW IT WORKS — 错位任务面板
           ════════════════════════════════════════════ */}
        <section className="relative py-24 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,240,255,0.03),transparent_60%)]" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">{globalStars.slice(0, 50).map((p, i) => (<div key={i} className="absolute rounded-full" style={{ width: `${p.w * 0.6}px`, height: `${p.h * 0.6}px`, top: `${p.top}%`, left: `${p.left}%`, backgroundColor: p.color, opacity: p.opacity * 0.5 }} />))}</div>

          {/* 电路装饰 */}
          <svg className="absolute left-0 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none w-96 h-96" viewBox="0 0 300 300">
            <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00f0ff" /><stop offset="100%" stopColor="#b347ea" /></linearGradient></defs>
            <path d="M0 50 L120 50 L140 70 L200 70 L220 50 L300 50" stroke="url(#cg)" strokeWidth="1.5" fill="none" />
            <path d="M0 150 L80 150 L100 130 L180 130 L200 150 L300 150" stroke="url(#cg)" strokeWidth="1" fill="none" />
            <path d="M0 250 L60 250 L80 230 L160 230 L180 250 L300 250" stroke="url(#cg)" strokeWidth="0.5" fill="none" />
            <circle cx="120" cy="50" r="4" fill="#00f0ff" opacity="0.6" /><circle cx="200" cy="50" r="3" fill="#00f0ff" opacity="0.4" />
            <circle cx="80" cy="150" r="3" fill="#b347ea" opacity="0.5" /><circle cx="180" cy="150" r="2" fill="#b347ea" opacity="0.3" />
            <circle cx="60" cy="250" r="2.5" fill="#ffb800" opacity="0.4" />
          </svg>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-xs font-bold tracking-[0.3em] uppercase rounded-full mb-4">◆ MISSION PROTOCOL</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">任务<span className="text-[#00f0ff]">流程</span></h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">完成四个任务，正式加入贝壳创业</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div className="hidden lg:flex absolute top-14 left-[12.5%] right-[12.5%] items-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-[#00f0ff] via-[#b347ea] to-[#00ff88]" />
              </div>
              {steps.map((s, i) => {
                const nc = neonC(s.neon); const offsets = ['lg:-translate-y-3', 'lg:translate-y-4', 'lg:-translate-y-5', 'lg:translate-y-2']; return (
                  <div key={i} className={`relative group pt-8 ${offsets[i]}`}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                      <div className={`w-14 h-14 rounded-2xl ${nc.bg} ${nc.b} border-2 flex items-center justify-center ${nc.t} text-xl ${nc.g} group-hover:scale-110 transition-all duration-300`}>{s.icon}</div>
                    </div>
                    <div className="holo-card pt-14 pb-6 px-5 h-full text-center">
                      <div className="text-xs font-bold tracking-[0.3em] text-gray-600 uppercase mb-3">Phase {s.num}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                      <div className={`mt-4 w-8 h-0.5 mx-auto rounded-full ${nc.bg} opacity-0 group-hover:opacity-100 group-hover:w-12 transition-all duration-500`} style={{ backgroundColor: s.neon === 'cyan' ? '#00f0ff' : s.neon === 'amber' ? '#ffb800' : s.neon === 'purple' ? '#b347ea' : '#00ff88' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
              FEATURES — 突破边框布局
           ════════════════════════════════════════════ */}
        <section className="relative py-24 sm:py-28 overflow-visible">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(179,71,234,0.04),transparent_60%)]" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">{globalStars.slice(50, 100).map((p, i) => (<div key={i} className="absolute rounded-full" style={{ width: `${p.w * 0.6}px`, height: `${p.h * 0.6}px`, top: `${p.top}%`, left: `${p.left}%`, backgroundColor: p.color, opacity: p.opacity * 0.5 }} />))}</div>

          {/* 大型六边形装饰 */}
          <div className="absolute right-0 top-0 pointer-events-none opacity-[0.03]" style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
            <svg width="400" height="400" viewBox="0 0 400 400"><polygon points="200,10 370,110 370,290 200,390 30,290 30,110" fill="none" stroke="#b347ea" strokeWidth="1.5" /><polygon points="200,60 320,130 320,270 200,340 80,270 80,130" fill="none" stroke="#b347ea" strokeWidth="0.8" opacity="0.5" /></svg>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#b347ea]/5 border border-[#b347ea]/15 text-[#b347ea] text-xs font-bold tracking-[0.3em] uppercase rounded-full mb-4">◆ CORE TECHNOLOGY</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">平台<span className="text-[#b347ea]">核心</span></h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">四大核心科技，为校园创业提供全方位支持</p>
            </div>

            {/* 非对称布局 + 定时聚光灯轮播 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f, i) => {
                const nc = neonC(f.neon);
                const isActive = activeFeature === i;
                return (
                  <div
                    key={i}
                    className={`holo-card p-6 group transition-all duration-700 overflow-hidden ${isActive ? 'scale-[1.04] z-10 shadow-[0_0_30px_rgba(0,240,255,0.15)]' : 'scale-100 opacity-70 hover:opacity-100'} ${i % 2 === 1 ? 'lg:translate-y-3' : 'lg:-translate-y-2'}`}
                    style={{ ...(isActive ? { borderColor: f.neon === 'cyan' ? 'rgba(0,240,255,0.5)' : f.neon === 'amber' ? 'rgba(255,184,0,0.4)' : f.neon === 'purple' ? 'rgba(179,71,234,0.4)' : 'rgba(0,255,136,0.4)' } : {}), transition: 'transform 0.1s ease-out, opacity 0.7s, box-shadow 0.7s, border-color 0.7s', willChange: 'transform' }}
                    onMouseMove={handleCardTilt}
                    onMouseLeave={handleCardLeave}
                  >
                    <div className="tilt-glow absolute inset-0 pointer-events-none" />
                    {/* 活跃指示条 */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-current to-transparent"
                        style={{ color: f.neon === 'cyan' ? '#00f0ff' : f.neon === 'amber' ? '#ffb800' : f.neon === 'purple' ? '#b347ea' : '#00ff88' }} />
                    )}

                    <div className={`w-12 h-12 rounded-2xl ${nc.bg} ${nc.b} border flex items-center justify-center ${nc.t} text-xl mb-4 flex-shrink-0 transition-all duration-500 ${isActive ? `scale-110 ${nc.g}` : 'group-hover:scale-110'}`}>
                      {f.icon}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white">{f.title}</h3>
                      {isActive && <span className={`text-[10px] font-mono tracking-wider animate-pulse ${nc.t}`}>◆ ACTIVE</span>}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* 轮播指示器 */}
            <div className="flex justify-center gap-2 mt-8">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`transition-all duration-500 rounded-full ${activeFeature === i
                    ? 'w-8 h-2 bg-gradient-to-r from-[#00f0ff] to-[#b347ea] shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                    : 'w-2 h-2 bg-white/10 hover:bg-white/25'
                    }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
              PROJECTS
           ════════════════════════════════════════════ */}
        <section className="relative py-24 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,184,0,0.03),transparent_60%)]" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">{globalStars.slice(70, 120).map((p, i) => (<div key={i} className="absolute rounded-full" style={{ width: `${p.w * 0.6}px`, height: `${p.h * 0.6}px`, top: `${p.top}%`, left: `${p.left}%`, backgroundColor: p.color, opacity: p.opacity * 0.5 }} />))}</div>

          {/* 装饰斜线 */}
          <svg className="absolute right-10 bottom-10 opacity-[0.04] pointer-events-none w-64 h-64" viewBox="0 0 200 200">
            <line x1="0" y1="200" x2="100" y2="100" stroke="#ffb800" strokeWidth="1" /><line x1="100" y1="100" x2="200" y2="200" stroke="#ffb800" strokeWidth="1" />
            <line x1="20" y1="200" x2="100" y2="120" stroke="#ffb800" strokeWidth="0.5" opacity="0.5" /><line x1="100" y1="120" x2="180" y2="200" stroke="#ffb800" strokeWidth="0.5" opacity="0.5" />
            <circle cx="100" cy="100" r="4" fill="#ffb800" opacity="0.4" />
          </svg>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ffb800]/5 border border-[#ffb800]/15 text-[#ffb800] text-xs font-bold tracking-[0.3em] uppercase rounded-full mb-4">◆ FEATURED MISSIONS</span>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">精选<span className="text-[#ffb800]">项目</span></h2>
              </div>
              <Link href="/projects" className="inline-flex items-center gap-2 text-[#ffb800] font-bold hover:text-[#ffd000] transition-colors group">查看更多项目<ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" /></Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="relative w-14 h-14"><div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" /><div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} /></div></div>
            ) : featuredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featuredProjects.map((p, i) => (<Link key={p.id} href={`/projects/${p.id}`} className={`holo-card overflow-hidden group flex flex-col card-enter ${i === 0 ? 'lg:row-span-1 lg:col-span-1' : ''}`}><div className="relative h-40 bg-gradient-to-br from-[#0a0a1a] to-[#101025] flex items-center justify-center overflow-hidden">{p.cover_image ? <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className={`w-16 h-16 rounded-2xl ${neonC('cyan').bg} ${neonC('cyan').b} border flex items-center justify-center`}><RocketOutlined className="text-2xl text-[#00f0ff]/50" /></div>}<div className="absolute top-3 right-3"><span className="px-3 py-1 bg-gradient-to-r from-[#ffb800] to-[#ff8c00] text-[#050510] text-xs font-black rounded-full">招募中</span></div><div className="absolute inset-0 bg-scanlines opacity-30 pointer-events-none" /></div><div className="p-5 flex flex-col flex-1"><h3 className="font-bold text-white group-hover:text-[#00f0ff] transition-colors mb-2 line-clamp-1">{p.title}</h3><p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">{p.description}</p><div className="flex flex-wrap gap-2">{p.tags?.split(',').slice(0, 2).map((t: string, j: number) => <span key={j} className="px-2 py-1 bg-white/[0.04] border border-white/[0.06] text-gray-500 rounded text-xs">{t.trim()}</span>)}{p.team && <span className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] rounded text-xs font-medium">✓ 已认证</span>}</div></div></Link>))}
              </div>
            ) : (<div className="text-center py-20 holo-card"><div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${neonC('cyan').bg} ${neonC('cyan').b} border flex items-center justify-center`}><RocketOutlined className="text-2xl text-[#00f0ff]/40" /></div><p className="text-gray-500">暂无精选项目</p></div>)}
          </div>
        </section>

        {/* ════════════════════════════════════════════
              CTA
           ════════════════════════════════════════════ */}
        <section className="relative py-28 sm:py-32 overflow-hidden bg-[#0a0a1a]">
          {/* 能量环 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full border border-[#00f0ff]/5 animate-pulse-slow" />
            <div className="absolute inset-[50px] rounded-full border border-[#b347ea]/8 animate-pulse-slow" style={{ animationDelay: '1s' }} />
            <div className="absolute inset-[120px] rounded-full border border-[#ffb800]/10 animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-[#00f0ff]/4 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-[#b347ea]/3 rounded-full blur-[120px]" />
          <div className="absolute inset-0">{floatingParticles.map((p, i) => (<div key={i} className="absolute rounded-full" style={{ width: `${p.w}px`, height: `${p.h}px`, top: `${p.top}%`, left: `${p.left}%`, backgroundColor: '#00f0ff', opacity: p.opacity, animation: `float ${p.duration}s ease-in-out infinite`, animationDelay: `${p.delay}s` }} />))}</div>

          {/* 倾斜装饰条 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent" style={{ transform: 'skewY(-1deg)' }} />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-sm text-[#00f0ff] mb-8"><FireOutlined /> READY TO LAUNCH</div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.05]">准备好<span className="bg-gradient-to-r from-[#00f0ff] to-[#b347ea] bg-clip-text text-transparent">启航</span>了吗</h2>
            <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">加入贝壳创业舰队，让你的项目从校园走向星辰大海</p>
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link href={isLoggedIn ? '/dashboard' : '/register'} className="group relative inline-flex items-center px-10 py-4 bg-gradient-to-r from-[#00f0ff] to-[#b347ea] text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(0,240,255,0.35)]"><span className="relative z-10 flex items-center gap-2">{isLoggedIn ? '进入控制台' : '立即加入舰队'}<RocketOutlined className="group-hover:translate-x-1 transition-transform" /></span></Link>
              <Link href="/about" className="group relative inline-flex items-center px-10 py-4 bg-transparent text-white font-bold rounded-xl border border-white/10 hover:border-[#00f0ff]/40 transition-all duration-300 hover:scale-105">了解更多<ArrowRightOutlined className="ml-2 group-hover:translate-x-1 transition-transform" /></Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600"><span className="flex items-center gap-2"><SafetyCertificateOutlined className="text-[#00ff88]" />官方认证平台</span><span className="w-1 h-1 bg-gray-800 rounded-full" /><span className="flex items-center gap-2"><TeamOutlined className="text-[#00f0ff]" />100+ 活跃团队</span><span className="w-1 h-1 bg-gray-800 rounded-full" /><span className="flex items-center gap-2"><FundOutlined className="text-[#ffb800]" />20+ 合作机构</span></div>
          </div>
        </section>
      </div>

      {/* ── 点击涟漪 ── */}
      {ripples.map(r => (
        <div key={r.id} className="fixed pointer-events-none z-[9997] rounded-full"
          style={{
            left: r.x, top: r.y,
            border: '1.5px solid rgba(0,240,255,0.5)',
            boxShadow: '0 0 15px rgba(0,240,255,0.4)',
            transform: 'translate(-50%,-50%)',
            animation: 'ripple-expand 0.8s ease-out forwards',
          }}
        />
      ))}

      {/* ── 拖尾 + 光标 (仅桌面端) ── */}
      {!isMobile && (
        <>
          {trail.map((p) => { const age = (trailSeq - p.id) / trailLen; if (age > 1 || age < 0 || p.x < 0) return null; const t = age; const r = Math.round(0 + t * 179); const g = Math.round(240 - t * 210); const b = Math.round(255 - t * 120 + (t > 0.5 ? (t - 0.5) * 2 * 135 : 0)); const color = `rgb(${r},${g},${b})`; const size = (1 - t) * 5 + 1.5; const alpha = (1 - t) * 0.85 + 0.15; return (<div key={p.id} className="fixed rounded-full pointer-events-none z-[9998]" style={{ width: `${size}px`, height: `${size}px`, left: `${p.x}px`, top: `${p.y}px`, background: `radial-gradient(circle, ${color} 0%, transparent 60%)`, boxShadow: `0 0 ${size * 4}px ${color}, 0 0 ${size * 2}px #fff`, opacity: alpha, transform: 'translate(-50%,-50%)' }} />); })}
          <div className="fixed pointer-events-none z-[9999]" style={{ left: `${cursorPixel.x}px`, top: `${cursorPixel.y}px`, transform: 'translate(-50%,-50%)' }}>
            <div className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00f0ff]/10 blur-xl animate-pulse-slow" />
            <div className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00f0ff]/30 animate-spin" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)', animationDuration: '3s' }} />
            <div className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b347ea]/20 animate-spin" style={{ clipPath: 'polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)', animationDuration: '3s', animationDirection: 'reverse' }} />
            <div className="absolute w-8 h-[1px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />
            <div className="absolute h-8 w-[1px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#00f0ff]/40 to-transparent" />
            <div className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-[0_0_20px_rgba(0,240,255,0.9),0_0_40px_rgba(0,240,255,0.5)]" />
          </div>
        </>
      )}
    </div>
  );
}
