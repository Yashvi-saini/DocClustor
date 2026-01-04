"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";

export function BackgroundAnimation() {
    const { mouseX, mouseY } = useMousePosition();
    const transformedX = useTransform(mouseX, (x) => x - 250);
    const transformedY = useTransform(mouseY, (y) => y - 250);

    const springConfig = { damping: 40, stiffness: 200, mass: 0.5 };
    const springX = useSpring(transformedX, springConfig);
    const springY = useSpring(transformedY, springConfig);


    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Cursor Follower */}
            <motion.div
                style={{ x: springX, y: springY }}
                className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full bg-[#018FFF] opacity-30 blur-[100px] z-0"
            />

            {/* Top Left */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 150, 0],
                    y: [0, 100, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[#4FF3D0] opacity-30 blur-[100px]"
            />

            {/* Top Right */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -200, 0],
                    y: [0, 150, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#018FFF] opacity-30 blur-[100px]"
            />

            {/* Bottom Left*/}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 180, 0],
                    y: [0, -150, 0]
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#018FFF] opacity-30 blur-[100px]"
            />

            {/* Bottom Right */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -150, 0],
                    y: [0, -200, 0],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#4FF3D0] opacity-30 blur-[100px]"
            />
        </div>
    );
}

