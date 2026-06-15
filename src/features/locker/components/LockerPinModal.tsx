"use client";

import React, { useState, useEffect } from "react";
import { Lock, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "../../dashboard/context/DashboardContext";
import { PinDots } from "./PinDots";
import { Keypad } from "./Keypad";
import toast from "react-hot-toast";

interface LockerPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function LockerPinModal({ isOpen, onClose, onSuccess }: LockerPinModalProps) {
    const { unlockLocker, isLockerLockedOut, lockedUntil, checkLockerStatus } = useDashboard();
    const [pin, setPin] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (isOpen) {
            setPin("");
            setErrorMsg("");
            checkLockerStatus();
        }
    }, [isOpen]);

    // Handle lockout timers
    useEffect(() => {
        if (isLockerLockedOut && lockedUntil) {
            const updateTimer = () => {
                const now = new Date();
                const diffMs = lockedUntil.getTime() - now.getTime();
                if (diffMs > 0) {
                    const diffMins = Math.ceil(diffMs / (1000 * 60));
                    setErrorMsg(`Locker is locked. Try again in ${diffMins} minutes.`);
                } else {
                    setErrorMsg("");
                }
            };
            updateTimer();
            const interval = setInterval(updateTimer, 30000);
            return () => clearInterval(interval);
        } else {
            setErrorMsg("");
        }
    }, [isLockerLockedOut, lockedUntil, isOpen]);

    if (!isOpen) return null;

    const handlePress = (num: string) => {
        if (isLockerLockedOut) return;
        if (pin.length < 4) {
            const next = pin + num;
            setPin(next);
            if (next.length === 4) {
                setTimeout(async () => {
                    try {
                        const ok = await unlockLocker(next);
                        if (ok) {
                            toast.success("Identity verified ✅");
                            onSuccess();
                            onClose();
                        }
                    } catch (err: any) {
                        setPin("");
                        const msg = err.message || "Incorrect PIN";
                        setErrorMsg(msg);
                        toast.error(msg);
                    }
                }, 300);
            }
        }
    };

    const handleDelete = () => {
        setPin((prev) => prev.slice(0, -1));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-[#001D3D]/50 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 m-4 flex flex-col p-6 font-poppins">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center mt-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#018FFF] mb-3">
                        <Lock size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-[#003259]">Enter Locker PIN</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                        Please enter your 4-digit security PIN to view or download this document.
                    </p>
                </div>

                {/* PIN Dots (Modular) */}
                <div className="my-4">
                    <PinDots pin={pin} sizeClassName="w-12 h-12" />
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-500 text-xs font-semibold px-4 py-2.5 rounded-xl mb-4"
                    >
                        <AlertCircle size={14} className="shrink-0" /> {errorMsg}
                    </motion.div>
                )}

                {/* Keypad (Modular) */}
                <div className="w-full max-w-[220px] mx-auto mb-2">
                    <Keypad 
                        onPress={handlePress} 
                        onDelete={handleDelete} 
                        buttonHeightClassName="h-10" 
                        maxWClassName="max-w-[220px]" 
                    />
                </div>
            </div>
        </div>
    );
}
