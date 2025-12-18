"use client";

import Carousel from "./Carousel";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "700"] });

const GradientGlow = ({ className, id }: { className?: string; id: string }) => (
  <svg
    width="259"
    height="183"
    viewBox="0 0 259 183"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g filter={`url(#${id})`}>
      <circle cx="129.5" cy="53" r="27" fill="#018FFF" />
    </g>
    <defs>
      <filter
        id={id}
        x="0"
        y="-76.5"
        width="259"
        height="259"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation="51.25"
          result="effect1_foregroundBlur_783_15278"
        />
      </filter>
    </defs>
  </svg>
);

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
      <div className="flex-1 flex flex-col items-center bg-white h-auto min-h-screen relative overflow-hidden">
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
        <div className="hidden md:flex w-full justify-center pt-[54px] shrink-0 items-center gap-3">
          <Image src="/logo(1).svg" alt="icon" width={39} height={39} />
          <Image src="/DocClustor.svg" alt="logo" width={169} height={24} />
        </div>
        {/* Logo - Mobile Only */}
        <div className="flex md:hidden w-full justify-center mt-[77px] shrink-0 relative">
          <div className="relative flex items-center justify-center">
            <GradientGlow
              id="mobile-logo-glow"
              className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[259px] h-[183px]"
            />
            <Image src="/logo(1).svg" alt="logo" width={39} height={39} className="relative z-10" />
          </div>
        </div>


        {/* Content Container */}
        <div className="w-full max-w-[520px] flex flex-col flex-1 justify-center p-4 min-h-min pb-8 md:pb-12 relative z-10">
          {children}
        </div>

        {/* Bottom Left Gradient - Mobile */}
        <div className="absolute bottom-0 left-0 md:hidden pointer-events-none z-0">
          <GradientGlow id="bottom-left-glow" className="w-[259px] h-[183px] transform translate-y-1/3 -translate-x-1/3" />
        </div>

        {/* Bottom Right Gradient - Mobile */}
        <div className="absolute bottom-0 right-0 md:hidden pointer-events-none z-0">
          <GradientGlow id="bottom-right-glow" className="w-[259px] h-[183px] transform translate-y-1/3 translate-x-1/3" />
        </div>

        {/* Mid Right Gradient - Mobile */}
        <div className="absolute top-1/2 right-0 md:hidden pointer-events-none z-0">
          <GradientGlow id="mid-right-glow" className="w-[259px] h-[183px] transform -translate-y-1/2 translate-x-1/3" />
        </div>
      </div>
    </div>
  );
}
