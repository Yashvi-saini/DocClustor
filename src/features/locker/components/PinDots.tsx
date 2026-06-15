"use client";

import React from "react";
import { motion } from "framer-motion";

interface PinDotsProps {
    pin: string;
    maxLength?: number;
    sizeClassName?: string;
}

export function PinDots({ pin, maxLength = 4, sizeClassName = "w-14 h-14" }: PinDotsProps) {
    const dots = Array.from({ length: maxLength });
    return (
        <div className="flex gap-3 justify-center my-2">
            {dots.map((_, i) => (
                <motion.div
                    key={i}
                    animate={pin[i] ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.15 }}
                    className={`${sizeClassName} rounded-md border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                        pin[i]
                            ? "border-[#018FFF] bg-[#018FFF] text-white shadow-lg shadow-[#018FFF]/25"
                            : "border-gray-200 bg-white text-transparent"
                    }`}
                >
                    {pin[i] ? "●" : ""}
                </motion.div>
            ))}
        </div>
    );
}
