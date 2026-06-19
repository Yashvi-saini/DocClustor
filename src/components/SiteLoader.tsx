"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";

export default function SiteLoader() {
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "Establishing Secure Locker Enclave",
    "Verifying Encrypted Credentials",
    "Initializing Zero-Knowledge Vaults",
    "Preparing Vector Index Pipelines",
    "Optimizing Workspace Latency",
    "Ready to Launch"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const docWidth = 125;
  const docHeight = 125;

  const animationDuration = 3.0;

  const doc1Variants: Variants = {
    animate: {
      y: [-240, 20, 80, 80],
      x: [-70, -35, 0, 0],
      rotate: [-60, -30, 0, 0],
      scale: [0, 1, 0.5, 0.5],
      opacity: [0, 1, 0.9, 0],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        times: [0, 0.4, 0.8, 1.0],
        ease: "easeInOut" as const,
      },
    },
  };

  const doc2Variants: Variants = {
    animate: {
      y: [-240, -240, 20, 80, 80],
      x: [0, 0, 0, 0, 0],
      rotate: [60, 60, 30, 0, 0],
      scale: [0, 0, 1, 0.5, 0.5],
      opacity: [0, 0, 1, 0.9, 0],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        times: [0, 0.25, 0.65, 0.85, 1.0],
        ease: "easeInOut" as const,
      },
    },
  };

  const doc3Variants: Variants = {
    animate: {
      y: [-240, -240, 20, 80, 80],
      x: [60, 60, 35, 0, 0],
      rotate: [-30, -30, 15, 0, 0],
      scale: [0, 0, 1, 0.5, 0.5],
      opacity: [0, 0, 1, 0.9, 0],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        times: [0, 0.5, 0.8, 0.95, 1.0],
        ease: "easeInOut" as const,
      },
    },
  };

  const frontFlapVariants: Variants = {
    animate: {
      rotateX: [0, 14, -3, 0, 14, -3, 0, 14, -3, 0],
      scaleY: [1, 0.94, 1.03, 1, 0.94, 1.03, 1, 0.94, 1.03, 1],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        times: [0, 0.16, 0.22, 0.28, 0.45, 0.51, 0.57, 0.74, 0.80, 1.0],
        ease: "easeInOut" as const,
      },
    },
  };


  const backFlapVariants: Variants = {
    animate: {
      scaleY: [1, 0.97, 1.015, 1, 0.97, 1.015, 1, 0.97, 1.015, 1],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        times: [0, 0.16, 0.22, 0.28, 0.45, 0.51, 0.57, 0.74, 0.80, 1.0],
        ease: "easeInOut" as const,
      },
    },
  };

  // Contact shadow reaction
  const shadowVariants: Variants = {
    animate: {
      scaleX: [1, 1.15, 0.93, 1, 1.15, 0.93, 1, 1.15, 0.93, 1],
      opacity: [0.12, 0.18, 0.09, 0.12, 0.18, 0.09, 0.12, 0.18, 0.09, 0.12],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        times: [0, 0.16, 0.22, 0.28, 0.45, 0.51, 0.57, 0.74, 0.80, 1.0],
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white select-none overflow-hidden">
      
      {/* Subtle light background ambient highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Animation Stage with 3D Perspective */}
      <div 
        className="relative w-[400px] h-[400px] flex items-center justify-center"
        style={{ perspective: 1000 }}
      >
        
        {/* Dynamic Floor Contact Shadow */}
        <motion.div
          className="absolute bg-slate-900 rounded-full blur-[3.5px] pointer-events-none"
          style={{ 
            width: 210, 
            height: 14, 
            top: "91.5%", 
            left: "50%", 
            marginLeft: "-105px" 
          }}
          variants={shadowVariants}
          animate="animate"
        />

        {/* BACK FLAP*/}
        <motion.div
          className="absolute z-10 w-[300px] h-[300px] origin-bottom flex items-center justify-center"
          variants={backFlapVariants}
          animate="animate"
          style={{ top: "30%" }}
        >
          <svg width="300" height="300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_12px_rgba(59,130,246,0.06)]">
            <path d="M20 18V7C20 5.89543 19.1046 5 18 5H11L9 3H4C2.89543 3 2 3.89543 2 5V18C2 19.1046 2.89543 20 4 20H18C19.1046 20 20 19.1046 20 18Z" fill="#3B82F6"/>
          </svg>
        </motion.div>

       
        
        {/* Document 1 */}
        <motion.div
          className="absolute z-20 origin-center"
          variants={doc1Variants}
          animate="animate"
          style={{ top: "25%", left: "50%", marginLeft: `-${docWidth / 2}px` }}
        >
          <svg width={docWidth} height={docHeight} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="#DBEAFE"/>
            <path d="M14 2V8H20L14 2Z" fill="#93C5FD"/>
            <rect x="7" y="12" width="10" height="2" rx="1" fill="#60A5FA"/>
            <rect x="7" y="16" width="10" height="2" rx="1" fill="#60A5FA"/>
            <rect x="7" y="8" width="4" height="2" rx="1" fill="#60A5FA"/>
          </svg>
        </motion.div>

        {/* Document 2 */}
        <motion.div
          className="absolute z-20 origin-center"
          variants={doc2Variants}
          animate="animate"
          style={{ top: "25%", left: "50%", marginLeft: `-${docWidth / 2}px` }}
        >
          <svg width={docWidth} height={docHeight} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="#DBEAFE"/>
            <path d="M14 2V8H20L14 2Z" fill="#93C5FD"/>
            <rect x="7" y="12" width="10" height="2" rx="1" fill="#60A5FA"/>
            <rect x="7" y="16" width="10" height="2" rx="1" fill="#60A5FA"/>
            <rect x="7" y="8" width="4" height="2" rx="1" fill="#60A5FA"/>
          </svg>
        </motion.div>

        {/* Document 3 */}
        <motion.div
          className="absolute z-20 origin-center"
          variants={doc3Variants}
          animate="animate"
          style={{ top: "25%", left: "50%", marginLeft: `-${docWidth / 2}px` }}
        >
          <svg width={docWidth} height={docHeight} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="#DBEAFE"/>
            <path d="M14 2V8H20L14 2Z" fill="#93C5FD"/>
            <rect x="7" y="12" width="10" height="2" rx="1" fill="#60A5FA"/>
            <rect x="7" y="16" width="10" height="2" rx="1" fill="#60A5FA"/>
            <rect x="7" y="8" width="4" height="2" rx="1" fill="#60A5FA"/>
          </svg>
        </motion.div>

        {/* FRONT FLAP */}
        <motion.div
          className="absolute z-30 w-[300px] h-[300px] origin-bottom flex items-center justify-center"
          variants={frontFlapVariants}
          animate="animate"
          style={{ 
            top: "30%",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden"
          }}
        >
          <svg width="300" height="300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_12px_24px_rgba(59,130,246,0.18)]">
            <path d="M22 18V9C22 7.89543 21.1046 7 20 7H4C2.89543 7 2 7.89543 2 9V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18Z" fill="#60A5FA"/>
          </svg>
        </motion.div>

      </div>

      {/* Dynamic Professional Status Text */}
      <div className="absolute bottom-24 flex items-center justify-center px-6 h-6 w-full pointer-events-none">
        {/* Text Transition Slide Fade */}
        <div className="overflow-hidden relative h-5 w-[360px] text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={statusIndex}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 0.6 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#003259] block whitespace-nowrap"
            >
              {statuses[statusIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
