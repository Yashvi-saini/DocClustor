import { LockerUI } from "@/features/locker/components/LockerUI";
import { BackgroundAnimation } from "@/components/ui/background-animation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function LockerPage() {
  return (
    <div className={`relative w-full overflow-hidden bg-[#F0F8FF] min-h-[calc(100vh-64px)] ${poppins.className}`}>
      <BackgroundAnimation />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-2">
        <LockerUI />
      </div>
    </div>
  );
}