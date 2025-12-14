"use client";

import Carousel from "./Carousel";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function AuthLayout({ children, images, contentTop = 30, showControls = false }: {
  children: React.ReactNode;
  images: string[];
  contentTop?: number;
  showControls?: boolean;
}) {
  const router = useRouter();
  return (
    <div
      className={`${poppins.className} flex w-full min-h-screen bg-[#003259]`}
    >
      {/* Left Carousel */}
      <div className="hidden md:flex relative w-[45%] bg-[#003259] min-h-screen overflow-hidden">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="absolute top-[41px] left-[58px] z-20 hover:opacity-80"
        >
          <Image src="/auth/topbackarrow.svg" alt="back" width={24} height={24} />
        </button>

        <Carousel images={images} showControls={showControls} />
      </div>

      {/* Right Form */}
      <div className="flex-1 flex flex-col items-center bg-white h-auto min-h-screen relative">
        {/* Mobile back arrow */}
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="md:hidden absolute top-4 left-4 z-20 rounded-full p-2 hover:bg-gray-100"
        >
          <Image src="/auth/mobilebackarrow.svg" alt="back" width={24} height={24} />
        </button>

        {/* Logo - Desktop Only */}
        <div className="hidden md:flex w-full justify-center pt-[54px] shrink-0">
          <Image src="/DocClustor.svg" alt="logo" width={169} height={24} />
        </div>

        {/* Content Container */}
        <div className="w-full max-w-[520px] flex flex-col flex-1 justify-center p-4 min-h-min pb-8 md:pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}
