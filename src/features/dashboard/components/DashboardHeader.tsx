import React from "react";
import Image from "next/image";

interface DashboardHeaderProps {
    username: string;
    avatarUrl?: string;
}

export function DashboardHeader({ username, avatarUrl }: DashboardHeaderProps) {
    return (
        <div className="flex items-center justify-between w-full mb-6">
            <h1 className="text-2xl font-bold font-poppins text-black">
                Good Morning , {username}
            </h1>
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="Profile Avatar"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500 font-bold text-lg">
                        {username.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
}
