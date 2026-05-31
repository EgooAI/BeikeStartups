'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { bannerApi } from '@/lib/api';
import { LeftOutlined, RightOutlined, PictureOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  status: string;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const AUTO_PLAY_MS = 5000;
  const PROGRESS_STEP = 100 / (AUTO_PLAY_MS / 50);

  const fetchBanners = async () => {
    try {
      const res = await bannerApi.list();
      if (res.data) {
        setBanners(res.data as Banner[]);
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageError = (bannerId: number) => {
    setFailedImages((prev) => new Set(prev).add(bannerId));
  };

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    progressRef.current = 0;
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setProgress(0);
    progressRef.current = 0;
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setProgress(0);
    progressRef.current = 0;
  }, [banners.length]);

  // 自动轮播 + 进度条
  useEffect(() => {
    if (banners.length <= 1) return;

    const progressTimer = setInterval(() => {
      progressRef.current += PROGRESS_STEP;
      setProgress(Math.min(progressRef.current, 100));
    }, 50);

    intervalRef.current = setInterval(() => {
      goToNext();
    }, AUTO_PLAY_MS);

    return () => {
      clearInterval(progressTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners.length, goToNext, PROGRESS_STEP]);

  if (loading) return null;
  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[560px] overflow-hidden bg-[#050510]">
      {/* 轮播图 */}
      {banners.map((banner, index) => {
        const isActive = index === currentIndex;
        const showFallback = failedImages.has(banner.id);

        return (
          <Link
            key={banner.id}
            href={banner.link_url || '/'}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
          >
            {/* 图片 / 占位 */}
            {showFallback ? (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#101025] to-[#050510] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-[#00f0ff]/10 flex items-center justify-center mb-4">
                  <PictureOutlined className="text-4xl text-[#00f0ff]/30" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 text-center px-8">
                  {banner.title}
                </h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />
              </div>
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out"
                style={{
                  backgroundImage: `url(${banner.image_url})`,
                  transform: isActive ? 'scale(1)' : 'scale(1.1)',
                }}
                onError={() => handleImageError(banner.id)}
              >
                {/* 多层渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050510]/95 via-[#050510]/60 to-[#050510]/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-[#050510]/30" />
                {/* 扫描线 */}
                <div className="absolute inset-0 bg-scanlines opacity-40" />
                {/* 底部发光边 */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />
              </div>
            )}

            {/* 文字内容 */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className={`max-w-xl transition-all duration-700 delay-200 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  {/* 角标 */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] text-xs font-bold tracking-wider uppercase rounded-full mb-4">
                    ◆ Featured
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-5xl font-black text-white mb-3 leading-tight drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    {banner.title}
                  </h2>
                  {/* 装饰线 */}
                  <div className="w-20 h-0.5 bg-gradient-to-r from-[#00f0ff] to-transparent mb-4" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      {/* 底部信息栏 */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex items-end justify-between">
            {/* 进度条 + 计数器 */}
            <div className="flex items-center gap-4">
              {/* 页码 */}
              <span className="text-white/60 text-sm font-mono tracking-wider">
                <span className="text-[#00f0ff] font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="text-white/20"> / {String(banners.length).padStart(2, '0')}</span>
              </span>

              {/* 进度条 */}
              <div className="w-32 sm:w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00f0ff] to-[#b347ea] rounded-full transition-all duration-50 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 导航圆点 */}
            <div className="flex items-center gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-8 h-2 bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 左右箭头 */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-[#00f0ff]/40 hover:bg-white/[0.06] transition-all duration-300 flex items-center justify-center text-white/60 hover:text-[#00f0ff] group"
          >
            <LeftOutlined className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-[#00f0ff]/40 hover:bg-white/[0.06] transition-all duration-300 flex items-center justify-center text-white/60 hover:text-[#00f0ff] group"
          >
            <RightOutlined className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}
    </div>
  );
}
