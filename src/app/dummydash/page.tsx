"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
      <div className="max-w-xl w-full bg-white rounded-xl shadow p-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-[#000]">Dashboard</h1>
        <p className="text-[#555] mb-6">You are logged in. This is a dummy dashboard.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="px-4 py-2 rounded bg-[#0B76FF] text-white hover:bg-[#0663d6]">
            Go to Home
          </Link>
          <button
            onClick={async () => {
              const { authService } = await import("@/services/auth.service");
              await authService.logout();
              window.location.href = "/login";
            }}
            className="px-4 py-2 rounded border border-[#0B76FF] text-[#0B76FF] hover:bg-[#eaf3ff]"
          >
            Log Out
          </button>
        </div>
      </div>
    </main>
  );
}
