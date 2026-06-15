"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface PinPanelProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    error?: boolean;
    errorMsg?: string;
}

export function PinPanel({
    title,
    subtitle,
    children,
    error,
    errorMsg
}: PinPanelProps) {
    return (
        <div className={`flex-1 w-full sm:w-1/2 bg-white rounded-lg border shadow-sm p-7 flex flex-col gap-5 transition-all ${
            error ? "border-red-300 shadow-red-100" : "border-gray-100"
        }`}>
            <div>
                <h3 className="text-xl font-bold text-[#003259] mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{subtitle}</p>
            </div>
            {children}
            {error && errorMsg && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-500 text-sm font-semibold px-4 py-2.5 rounded-md animate-shake"
                >
                    <AlertCircle size={15} /> {errorMsg}
                </motion.div>
            )}
        </div>
    );
}
