"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

type Props = {
  images: string[];
  showControls?: boolean;
};

export default function Carousel({ images, showControls = false }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % images.length),
      3000 
    );

    return () => clearInterval(interval);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute top-[100px] left-[100px] right-[100px] bottom-[80px] transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"
            }`}
        >
          <Image src={src} alt="carousel-image" fill className="object-contain" />
        </div>
      ))}
      {showControls && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className="absolute top-[420px] left-[60px] p-2 rounded-full hover:opacity-80 focus:outline-none"
          >
            <Image src="/auth/leftarrow.svg" alt="left" width={24} height={24} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className="absolute top-[420px] right-[60px] p-2 rounded-full hover:opacity-80 focus:outline-none"
          >
            <Image src="/auth/rightarrow.svg" alt="right" width={24} height={24} />
          </button>
        </>
      )}
    </div>
  );
}