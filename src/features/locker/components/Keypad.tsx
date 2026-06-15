"use client";

import React from "react";
import { Delete } from "lucide-react";

interface KeypadProps {
    onPress: (val: string) => void;
    onDelete: () => void;
    buttonHeightClassName?: string;
    maxWClassName?: string;
}

export function Keypad({
    onPress,
    onDelete,
    buttonHeightClassName = "h-14",
    maxWClassName = "max-w-[280px]"
}: KeypadProps) {
    const rows = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        ["", "0", "⌫"],
    ];
    return (
        <div className={`space-y-3 w-full ${maxWClassName} mx-auto`}>
            {rows.map((row, ri) => (
                <div key={ri} className="grid grid-cols-3 gap-3">
                    {row.map((k, ki) => {
                        if (k === "") return <div key={ki} />;
                        const isDel = k === "⌫";
                        return (
                            <button
                                key={ki}
                                onClick={() => isDel ? onDelete() : onPress(k)}
                                className={`${buttonHeightClassName} rounded-xl text-lg font-bold border transition-colors shadow-sm ${
                                    isDel
                                        ? "border-red-100 bg-red-50 text-red-400 hover:bg-red-100"
                                        : "border-gray-100 bg-gray-50 text-[#003259] hover:bg-[#E0F2FE]"
                                }`}
                            >
                                {isDel ? <Delete size={18} className="mx-auto" /> : k}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
