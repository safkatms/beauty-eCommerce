import BannerCarousel from "@/components/bannerCarousel";
import Header from "@/components/header";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="p-6">
      <BannerCarousel />
    </div>
    </>
  );
}
