"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Banner {
  id: number;
  imageUrl: string;
  title?: string;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banner");
        const data = await res.json();
        setBanners(data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading banners...</p>;
  }

  if (!banners.length) {
    return <p className="text-center text-gray-500">No banners available.</p>;
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop={true}
        className="shadow-lg"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px]">
            <img
              src={banner.imageUrl}
              alt={banner.title || "Banner"}
              className="w-full h-full object-cover"
            />
          </div>
        </SwiperSlide>        
        ))}
      </Swiper>
    </div>
  );
}
