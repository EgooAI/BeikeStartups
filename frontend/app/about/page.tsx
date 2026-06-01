'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { isAuthenticated } from '@/lib/auth';
import {
  RocketOutlined, TeamOutlined, FundOutlined, ExperimentOutlined, BuildOutlined,
  ArrowRightOutlined, BulbOutlined, HeartOutlined, SafetyOutlined,
  ThunderboltOutlined, GlobalOutlined, StarOutlined, FireOutlined,
  CheckCircleOutlined, PlayCircleOutlined, CaretRightOutlined,
} from '@ant-design/icons';

const neonMap: Record<string, { t: string; b: string; bg: string }> = ({
  cyan: { t: 'text-[#00f0ff]', b: 'border-[#00f0ff]/25', bg: 'bg-[#00f0ff]/8' },
  amber: { t: 'text-[#ffb800]', b: 'border-[#ffb800]/25', bg: 'bg-[#ffb800]/8' },
  purple: { t: 'text-[#b347ea]', b: 'border-[#b347ea]/25', bg: 'bg-[#b347ea]/8' },
  green: { t: 'text-[#00ff88]', b: 'border-[#00ff88]/25', bg: 'bg-[#00ff88]/8' },
});
const neon = (k: string) => neonMap[k] || neonMap.cyan;

const values = [
  { icon: <BulbOutlined />, title: '创新驱动', desc: '鼓励校园创新，支持每一个有价值的想法从0到1', n: 'cyan', num: '01' },
  { icon: <HeartOutlined />, title: '真实可信', desc: '严格认证机制，确保平台项目信息真实可靠', n: 'amber', num: '02' },
  { icon: <TeamOutlined />, title: '开放协作', desc: '连接多方资源，构建开放高效的创投协作生态', n: 'purple', num: '03' },
  { icon: <SafetyOutlined />, title: '持续成长', desc: '全周期孵化陪伴，从种子阶段走向更大的舞台', n: 'green', num: '04' },
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

export default function AboutPage() {
  const [isLoggedIn] = useState(() => isAuthenticated());
  const [isVisible] = useState(true);
  const trailLen = 18;
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>(() => Array.from({ length: trailLen }, (_, i) => ({ x: -100, y: -100, id: i })));
  const [trailSeq, setTrailSeq] = useState(0);
  const [cursorPixel, setCursorPixel] = useState({ x: -100, y: -100 });
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const rippleRef = useRef(0);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [particlesEnabled, setParticlesEnabled] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('particlesEnabled') !== 'false';
    return true;
  });

  const toggleParticles = () => {
    setParticlesEnabled(prev => {
      const next = !prev;
      localStorage.setItem('particlesEnabled', String(next));
      return next;
    });
  };

  // 移动端检测
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 鼠标跟踪 (仅桌面端，可手动关闭)
  useEffect(() => {
    if (isMobile || !particlesEnabled) return;
    let seq = 0;
    const mm = (e: MouseEvent) => { const pp = { x: e.clientX, y: e.clientY }; setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }); setCursorPixel(pp); seq += 1; const id = seq; setTrailSeq(id); setTrail(p => { const n = [...p]; n[id % trailLen] = { ...pp, id }; return n; }); };
    window.addEventListener('mousemove', mm); return () => window.removeEventListener('mousemove', mm);
  }, [isMobile, particlesEnabled]);
  // 点击涟漪
  useEffect(() => { const h = (e: MouseEvent) => { const id = ++rippleRef.current; setRipples(p => [...p.slice(-6), { x: e.clientX, y: e.clientY, id }]); }; window.addEventListener('click', h); return () => window.removeEventListener('click', h); }, []);

  // 交互星图 (仅桌面端，可手动关闭)
  useEffect(() => {
    if (isMobile || !particlesEnabled) return;
    const canvas = starCanvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d')!; const w = () => window.innerWidth; const h = () => window.innerHeight; canvas.width = w(); canvas.height = h();
    const stars: { x: number; y: number; ox: number; oy: number; vx: number; vy: number; r: number; alpha: number; twinkle: number; color: string }[] = [];
    const colors = ['#ffffff', '#00f0ff', '#ffb800', '#b347ea', '#00ff88'];
    for (let i = 0; i < 200; i++) { const x = Math.random() * w(), y = Math.random() * h(); stars.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, r: Math.random() * 2.5 + 1, alpha: Math.random() * 0.5 + 0.2, twinkle: Math.random() * Math.PI * 2, color: colors[Math.floor(Math.random() * colors.length)] }); }
    const mouse = { x: -500, y: -500 }, pmouse = { x: -500, y: -500 };
    const um = (e: MouseEvent) => { pmouse.x = mouse.x; pmouse.y = mouse.y; mouse.x = e.clientX; mouse.y = e.clientY; };
    const rs = () => { canvas.width = w(); canvas.height = h(); };
    window.addEventListener('mousemove', um); window.addEventListener('resize', rs);
    const R = 220, F = 8, RT = 0.003; let aid: number;
    function draw() {
      ctx.clearRect(0, 0, w(), h()); const mx = mouse.x - pmouse.x, my = mouse.y - pmouse.y, ms = Math.sqrt(mx * mx + my * my);
      for (const s of stars) {
        const dx = s.x - mouse.x, dy = s.y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < R && dist > 0.5) { const f = (R - dist) / R * F * Math.min(ms * 0.3 + 1, 6); s.vx += (dx / dist) * f; s.vy += (dy / dist) * f; }
        s.vx += (s.ox - s.x) * RT; s.vy += (s.oy - s.y) * RT; s.vx *= 0.92; s.vy *= 0.92; s.x += s.vx; s.y += s.vy; s.twinkle += 0.015; const b = Math.min(1, s.alpha + (dist < R ? (1 - dist / R) * 0.6 : 0));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.globalAlpha = b * 0.08; ctx.fill();
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.globalAlpha = b; ctx.fill();
        if (s.r > 2 && b > 0.5) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.globalAlpha = b * 0.7; ctx.fill(); } ctx.globalAlpha = 1;
      }
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) { const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y, dist = Math.sqrt(dx * dx + dy * dy), near = Math.hypot(stars[i].x - mouse.x, stars[i].y - mouse.y) < R || Math.hypot(stars[j].x - mouse.x, stars[j].y - mouse.y) < R, mD = near ? 130 : 40; if (dist < mD) { ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[j].x, stars[j].y); ctx.strokeStyle = `rgba(0,240,255,${(1 - dist / mD) * (near ? 0.15 : 0.03)})`; ctx.lineWidth = 0.5; ctx.stroke(); } }
        const dm = Math.hypot(stars[i].x - mouse.x, stars[i].y - mouse.y); if (dm < R) { ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.strokeStyle = `rgba(0,240,255,${(1 - dm / R) * 0.25})`; ctx.lineWidth = 0.3; ctx.stroke(); }
      } aid = requestAnimationFrame(draw);
    } draw();
    return () => { window.removeEventListener('mousemove', um); window.removeEventListener('resize', rs); cancelAnimationFrame(aid); };
  }, [isMobile, particlesEnabled]);

  const tilt = (e: React.MouseEvent) => { const r = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; (e.currentTarget as HTMLElement).style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`; };
  const reset = (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)'; };

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      {!isMobile && particlesEnabled && <canvas ref={starCanvasRef} className="fixed inset-0 pointer-events-none z-[2]" />}
      <div className="fixed inset-0 bg-scanlines opacity-30 pointer-events-none z-[1]" />

      <div className="relative z-[3]">
        {/* ════════════════════════════════════════════
              HERO — 全屏分割
           ════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center">
          <div className="absolute pointer-events-none w-[35rem] h-[35rem] rounded-full blur-[150px] transition-[left,top] duration-[2s]" style={{ left: `${mousePos.x * 100}%`, top: `${mousePos.y * 100}%`, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle,rgba(0,240,255,0.04) 0%,transparent 70%)' }} />
          <div className="absolute top-1/3 right-1/4 w-[25rem] h-[25rem] bg-[#b347ea]/3 rounded-full blur-[100px] animate-pulse-slow" />

          {/* 数据流 */}
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="absolute w-px pointer-events-none" style={{ left: `${15 + i * 14}%`, top: 0, bottom: 0, background: `linear-gradient(to bottom,transparent,${['#00f0ff', '#b347ea', '#ffb800'][i % 3]}18 40%,${['#00f0ff', '#b347ea', '#ffb800'][i % 3]}33 70%,transparent)`, animation: `float ${5 + i * 1.5}s ease-in-out infinite`, animationDelay: `${i * 0.8}s`, opacity: 0.35 }} />))}

          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* 左 — 文字 */}
              <div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] backdrop-blur-md rounded-full border border-[#00f0ff]/20 text-sm text-[#00f0ff] mb-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f0ff]" /></span>
                  <ThunderboltOutlined /> SYSTEM ONLINE
                </div>
                <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[0.9] ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
                  <span className="text-white">贝壳</span><br />
                  <span className="bg-gradient-to-r from-[#00f0ff] via-[#b347ea] to-[#ffb800] bg-clip-text text-transparent">创业俱乐部</span>
                </h1>
                <p className={`text-lg text-gray-400 max-w-md mb-10 leading-relaxed ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                  让校园创业项目，被更多人看见。连接创新、资源与未来。
                </p>
                <div className={`flex gap-4 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                  <Link href={isLoggedIn ? '/dashboard' : '/register'} className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.35)] transition-all duration-300 hover:scale-105"><PlayCircleOutlined />{isLoggedIn ? '马上行动' : '立即加入'}<CaretRightOutlined className="group-hover:translate-x-1 transition-transform" /></Link>
                  <Link href="/projects" className="group inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-bold rounded-xl border border-white/10 hover:border-[#00f0ff]/40 transition-all duration-300 hover:scale-105">浏览项目<ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" /></Link>
                </div>
              </div>

              {/* 右 — 大数字面板 */}
              <div className={`hidden lg:block ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                <div className="grid grid-cols-2 gap-4">
                  {[{ v: '128+', l: '入驻项目', n: 'cyan' }, { v: '36+', l: '认证团队', n: 'amber' }, { v: '50+', l: '导师资源', n: 'purple' }, { v: '20+', l: '投资机构', n: 'green' }].map((s, i) => {
                    const nc = neon(s.n); return (
                      <div key={i} className={`holo-card p-6 text-center ${i === 0 ? '-mt-8' : i === 3 ? '-mb-8' : ''}`} onMouseMove={tilt} onMouseLeave={reset} style={{ transition: 'transform 0.1s ease-out', willChange: 'transform' }}>
                        <div className={`text-5xl font-black ${nc.t} mb-2`}>{s.v}</div>
                        <div className="text-xs text-gray-400 tracking-widest uppercase">{s.l}</div>
                        <div className="energy-bar mt-3"><div className="energy-bar-fill" style={{ width: `${70 + i * 10}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a1a] to-transparent" />
        </section>

        {/* ════════════════════════════════════════════
              MISSION — 宽幅引言
           ════════════════════════════════════════════ */}
        <section className="relative py-20 sm:py-28 bg-[#0a0a1a]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] text-xs font-bold tracking-[0.2em] uppercase rounded-full mb-8">◆ OUR MISSION</span>
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-light text-white/80 leading-relaxed mb-8 italic">
              贝壳创业俱乐部致力于打造高校创新创业项目展示与资源匹配平台。我们汇聚校内优秀创业团队，连接校外导师、投资人、产业资源方与学生创客，让每一个有价值的想法都能获得展示、交流和成长的机会。
            </blockquote>
            <div className="w-20 h-0.5 bg-gradient-to-r from-[#00f0ff] to-[#b347ea] mx-auto" />
          </div>
        </section>

        {/* ════════════════════════════════════════════
              VALUES — 数字序列
           ════════════════════════════════════════════ */}
        <section className="relative py-24 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {values.map((v, i) => {
                const nc = neon(v.n); return (
                  <div key={i} className="holo-card p-8 group flex gap-6" onMouseMove={tilt} onMouseLeave={reset} style={{ transition: 'transform 0.1s ease-out', willChange: 'transform' }}>
                    <div className={`text-6xl font-black ${nc.t} opacity-60 flex-shrink-0 leading-none`}>{v.num}</div>
                    <div>
                      <div className={`w-12 h-12 rounded-2xl ${nc.bg} ${nc.b} border flex items-center justify-center ${nc.t} text-xl mb-4`}>{v.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{v.title}</h3>
                      <p className="text-sm text-white/70 leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
              PROBLEM / SOLUTION — 窄版对照
           ════════════════════════════════════════════ */}
        <section className="relative py-24 sm:py-28 bg-[#0a0a1a]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              <div className="holo-card p-8 rounded-r-none" style={{ borderColor: 'rgba(255,80,80,0.1)' }}>
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center mb-4"><span className="text-red-400 text-xs">✕</span></div>
                <h3 className="text-lg font-bold text-white mb-3">当前困境</h3>
                <p className="text-sm text-gray-400 leading-relaxed">校园项目有创意缺曝光，投资人想支持却难以系统了解校内项目。信息不对称、渠道分散、认证困难是长期挑战。</p>
              </div>
              <div className="holo-card p-8 rounded-l-none" style={{ borderColor: 'rgba(0,255,136,0.1)' }}>
                <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/15 flex items-center justify-center mb-4"><CheckCircleOutlined className="text-[#00ff88] text-xs" /></div>
                <h3 className="text-lg font-bold text-white mb-3">我们的方案</h3>
                <p className="text-sm text-gray-400 leading-relaxed">统一认证展示平台 + 智能资源匹配 + 全周期服务，构建可信赖的校园创投生态。</p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
              OFFERINGS — 宽窄交替
           ════════════════════════════════════════════ */}
        <section className="relative py-24 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#b347ea]/5 border border-[#b347ea]/15 text-[#b347ea] text-xs font-bold tracking-[0.2em] uppercase rounded-full mb-6">◆ CAPABILITIES</span>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95]">
                <span className="text-white">平台</span><br />
                <span className="bg-gradient-to-r from-[#b347ea] to-[#00f0ff] bg-clip-text text-transparent">能力矩阵</span>
              </h2>
            </div>
            <div className="space-y-3">
              {offerings.map((o, i) => {
                const isOdd = i % 2 === 1;
                return (
                  <div key={i} className={`holo-card p-5 flex items-center gap-4 group ${isOdd ? 'ml-auto max-w-2xl' : 'max-w-3xl'}`} style={{ width: isOdd ? '65%' : '80%' }} onMouseMove={tilt} onMouseLeave={reset}>
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-[#00f0ff]/8 group-hover:border-[#00f0ff]/20 transition-all duration-300">
                      <span className="text-[#00f0ff] group-hover:scale-110 transition-transform duration-300 text-sm">{o.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{o.title}</h4>
                      <p className="text-xs text-gray-400">{o.desc}</p>
                    </div>
                    <div className="ml-auto text-gray-400 text-xs font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">{String(i + 1).padStart(2, '0')}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
              CTA
           ════════════════════════════════════════════ */}
        <section className="relative py-32 sm:py-40 bg-[#050510] overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full border border-[#00f0ff]/5 animate-pulse-slow" />
            <div className="absolute inset-[40px] rounded-full border border-[#b347ea]/8 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25rem] h-[25rem] bg-[#00f0ff]/4 rounded-full blur-[120px]" />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[0.95]">
              <span className="text-white">准备好</span><br />
              <span className="bg-gradient-to-r from-[#00f0ff] to-[#b347ea] bg-clip-text text-transparent">启航了吗</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12">加入贝壳创业舰队，让你的项目从校园走向星辰大海</p>
            <Link href={isLoggedIn ? '/dashboard' : '/register'} className="group inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-[#00f0ff] to-[#b347ea] text-white font-bold rounded-xl hover:shadow-[0_0_60px_rgba(0,240,255,0.35)] transition-all duration-300 hover:scale-105 text-lg">
              {isLoggedIn ? '进入控制台' : '立即加入舰队'}
              <RocketOutlined className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </div>

      {/* 涟漪 + 拖尾 + 光标 (仅桌面端，可手动关闭) */}
      {!isMobile && particlesEnabled && (
        <>
          {ripples.map(r => (<div key={r.id} className="fixed pointer-events-none z-[9997] rounded-full" style={{ left: r.x, top: r.y, border: '1.5px solid rgba(0,240,255,0.5)', boxShadow: '0 0 15px rgba(0,240,255,0.4)', transform: 'translate(-50%,-50%)', animation: 'ripple-expand 0.8s ease-out forwards' }} />))}
          {/* 拖尾 */}
          {trail.map(p => { const a = (trailSeq - p.id) / trailLen; if (a > 1 || a < 0 || p.x < 0) return null; const t = a, rr = Math.round(0 + t * 179), g = Math.round(240 - t * 210), b = Math.round(255 - t * 120 + (t > 0.5 ? (t - 0.5) * 2 * 135 : 0)), c = `rgb(${rr},${g},${b})`, s = (1 - t) * 5 + 1.5, al = (1 - t) * 0.85 + 0.15; return (<div key={p.id} className="fixed rounded-full pointer-events-none z-[9998]" style={{ width: `${s}px`, height: `${s}px`, left: `${p.x}px`, top: `${p.y}px`, background: `radial-gradient(circle,${c} 0%,transparent 60%)`, boxShadow: `0 0 ${s * 4}px ${c},0 0 ${s * 2}px #fff`, opacity: al, transform: 'translate(-50%,-50%)' }} />); })}
          {/* 光标 */}
          <div className="fixed pointer-events-none z-[9999]" style={{ left: `${cursorPixel.x}px`, top: `${cursorPixel.y}px`, transform: 'translate(-50%,-50%)' }}>
            <div className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00f0ff]/8 blur-xl animate-pulse-slow" />
            <div className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00f0ff]/25 animate-spin" style={{ clipPath: 'polygon(0% 0%,100% 0%,100% 50%,0% 50%)', animationDuration: '3s' }} />
            <div className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b347ea]/15 animate-spin" style={{ clipPath: 'polygon(0% 50%,100% 50%,100% 100%,0% 100%)', animationDuration: '3s', animationDirection: 'reverse' }} />
            <div className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-[0_0_15px_rgba(0,240,255,0.8)]" />
          </div>
        </>
      )}

      {/* ── 粒子开关 (仅桌面端) ── */}
      {!isMobile && (
        <button
          onClick={toggleParticles}
          className="fixed bottom-6 right-6 z-[10000] flex items-center gap-2 px-3.5 py-2.5 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 shadow-lg"
          title={particlesEnabled ? '关闭粒子交互' : '开启粒子交互'}
        >
          <span className={`relative flex h-2 w-2 ${particlesEnabled ? '' : 'opacity-40'}`}>
            <span className={`absolute inline-flex h-full w-full rounded-full ${particlesEnabled ? 'bg-[#00ff88] animate-ping opacity-75' : 'bg-gray-500'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${particlesEnabled ? 'bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]' : 'bg-gray-500'}`} />
          </span>
          <span>粒子交互</span>
        </button>
      )}
    </div>
  );
}
