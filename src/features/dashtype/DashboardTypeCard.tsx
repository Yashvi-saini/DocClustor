"use client";
import Image from "next/image";
import Link from "next/link";

const dashboardTypes = [
    {
        icon: "/dashtypepage/individual.svg",
        title: "Individual Dashboard",
        description: "Perfect for personal use and individual projects",
        features: [
            "Personal document management",
            "Private workspace",
            "Basic collaborations",
            "Upto 1 GB of free storage"
        ]
    },
    {
        icon: "/dashtypepage/company.svg",
        title: "Company Dashboard",
        description: "Perfect for Teams and manage projects",
        features: [
            "Team Documents Management",
            "Team Workspace",
            "Collaborations",
            "Upto 10 GB of free storage"
        ]
    }
];

export default function DashboardTypeCard() {
    return (
        <div className="bg-white rounded-2xl sm:rounded-[24px] shadow-2xl p-5 sm:p-6 md:p-8 lg:p-10 w-full" style={{ fontFamily: 'var(--font-poppins)' }}>
          <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
                    <Image src="/logo(1).svg" alt="Logo" width={39} height={39} 
                      className="w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] md:w-[39px] md:h-[39px]"
                    />
                    <Image src="/DocClustor.svg" alt="DocCluster" width={169} height={24}
                     className="w-[130px] h-[18px] sm:w-[150px] sm:h-[21px] md:w-[169px] md:h-[24px]"
                    />
                </div>
               <h1 className="text-[24px] font-semibold text-[#000000] mb-1 px-2 text-center" style={{ fontWeight: 600, lineHeight: 'normal' }}>
                    Choose Your Dashboard Type
                </h1>
                <p className="text-[15px] font-medium text-[#000000] px-2 sm:px-4 text-center" style={{ fontWeight: 500, lineHeight: 'normal' }}>
                    Select the option that best fits your needs to access all platform features
                </p>
          </div>
            {/* cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {dashboardTypes.map((dashboard, index) => (
                    <div key={index} className="group relative bg-[#E6E6E6] rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 hover:bg-[#018FFF] hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 sm:mb-5">
                                <Image src={dashboard.icon} alt={dashboard.title} width={60} height={60}
                                    className="w-[50px] h-[50px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px]"
                                />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#003259] group-hover:text-white mb-1.5 sm:mb-2">
                                {dashboard.title}
                            </h2>
                            <p className="text-[12px] text-[#666666] group-hover:text-white/90 mb-4 sm:mb-6 whitespace-nowrap">
                                {dashboard.description}
                            </p>
                            <ul className="text-left text-[13px] text-[#666666] group-hover:text-white/90 space-y-1.5 sm:space-y-2 w-full whitespace-nowrap">
                                {dashboard.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start">
                                        <span className="text-[#018FFF] group-hover:text-white mr-2 flex-shrink-0">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 mt-4 sm:mt-6">
                <Link
                    href="/"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#0B76FF] text-white font-medium hover:bg-[#0663d6] transition-colors duration-200 shadow-md text-center"
                >
                    Go to Home
                </Link>
                <button
                    onClick={async () => {
                        const { authService } = await import("@/services/auth.service");
                        await authService.logout();
                        window.location.href = "/login";
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 border-[#0B76FF] text-[#0B76FF] font-medium hover:bg-[#eaf3ff] transition-colors duration-200 shadow-md"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}
