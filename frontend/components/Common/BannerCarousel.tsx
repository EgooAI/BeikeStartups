'use client';

import { useEffect, useState, useCallback } from 'react';
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

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [banners.length, goToNext]);

  if (loading) {
    return null;
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const showFallback = currentBanner && failedImages.has(currentBanner.id);

  return (
    <div className="relative w-full h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden">
      {banners.map((banner, index) => (
        <Link
          key={banner.id}
          href={banner.link_url || '/'}
          className={`absolute inset-0 transition-opacity duration-700 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          {failedImages.has(banner.id) ? (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a7c] flex flex-col items-center justify-center">
              <PictureOutlined className="text-6xl text-white/50 mb-4" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg px-8 text-center">
                {banner.title}
              </h2>
            </div>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.image_url})` }}
              onError={() => handleImageError(banner.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            </div>
          )}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                  {banner.title}
                </h2>
              </div>
            </div>
          </div>
        </Link>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white"
          >
            <LeftOutlined />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white"
          >
            <RightOutlined />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}