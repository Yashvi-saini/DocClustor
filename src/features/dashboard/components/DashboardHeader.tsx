import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
    username: string;
    avatarUrl?: string;
}

export function DashboardHeader({ username, avatarUrl }: DashboardHeaderProps) {
    const pathname = usePathname();
    const basePath = pathname?.startsWith("/company") ? "/company" : "/individual";

    return (
        <div className="flex items-center justify-between w-full mb-6">
            <h1 className="text-2xl font-bold font-poppins text-black">
            Hello , {username}
            </h1>
            <Link href={`${basePath}/profile`}>
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm hover:ring-2 hover:ring-[#0B76FF] transition-all cursor-pointer">
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
            </Link>
        </div>
    );
}
