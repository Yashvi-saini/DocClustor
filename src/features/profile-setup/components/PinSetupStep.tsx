"use client";

import React from "react";
import OtpInput from "@/features/auth/inputfield_ui/OtpInput";

interface PinSetupProps {
    data: {
        pin: string;
        confirmPin: string;
    };
    update: (data: any) => void;
}

export function PinSetupStep({ data, update }: PinSetupProps) {
    return (
        <div className="w-full space-y-8 px-2 sm:px-6 py-4 min-h-[320px] flex flex-col items-center justify-center">

            <div className="text-center space-y-1">
                <h3 className="text-[20px] font-bold text-[#000]">Set a Locker Pin</h3>
                <p className="text-[14px] text-[#000] whitespace-nowrap">Set a 6-digit PIN to keep your private documents safe.</p>
            </div>

            <div className="w-full flex flex-col items-center gap-6">
                {/* Create Pin */}
                <div className="w-fit flex flex-col items-start">
                    <label className="block text-[14px] font-medium text-[#000] mb-2 pl-1">Create Pin</label>
                    <OtpInput
                        length={6}
                        onChange={(code) => update({ pin: code })}
                        className="!w-fit gap-3 sm:gap-3"
                    />
                </div>

                {/* Confirm Pin */}
                <div className="w-fit flex flex-col items-start">
                    <label className="block text-[14px] font-medium text-[#000] mb-2 pl-1">Confirm Pin</label>
                    <OtpInput
                        length={6}
                        onChange={(code) => update({ confirmPin: code })}
                        className="!w-fit gap-3 sm:gap-3"
                    />
                </div>
            </div>

        </div>
    );
}
