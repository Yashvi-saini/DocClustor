import DashboardTypeCard from "@/features/dashtype/DashboardTypeCard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#003259] flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[588px] md:h-[588px] rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-60"
          style={{ background: '#018FFF' }}
        />
        <div
          className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[588px] md:h-[588px] rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-60"
          style={{ background: '#4FF3D0' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-4 sm:gap-6">
        <DashboardTypeCard />
      </div>
    </main>
  );
}
