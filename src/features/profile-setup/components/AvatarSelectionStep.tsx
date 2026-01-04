import Image from "next/image";
import { Button } from "@/components/ui/button";

export function AvatarSelectionStep() {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[320px]">
            {/* Main Avatar Display (Placeholder) */}
            <div className="mb-6 relative">
                <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-[#0B76FF] bg-white flex items-center justify-center relative">
                    <Image
                        src="/setup/profile.svg"
                        alt="Profile Placeholder"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 mb-6 w-full max-w-sm justify-center">
                <Button
                    type="button"
                    className="flex-1 bg-[#0B76FF] hover:bg-[#0663d6] h-[45px] text-[16px] font-bold text-white"
                    onClick={() => {
                        // Camera Logic
                    }}
                >
                Camera
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[2px] border-[#0B76FF] text-[#0B76FF] h-[45px] text-[16px] font-bold"
                    onClick={() => {
                    // Upload Logic
                    }}
                >
                 Upload Image
                </Button>
            </div>

            {/* Placeholders Grid */}
            <div className="grid grid-cols-4 gap-6 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((_, idx) => (
                    <div
                        key={idx}
                        className="w-[60px] h-[60px] rounded-full bg-[#f6f6f6] flex items-center justify-center shrink-0"
                    />
                ))}
            </div>
        </div>
    );
}
