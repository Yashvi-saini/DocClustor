"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BackgroundAnimation } from "@/components/ui/background-animation";
import { AvatarSelectionStep } from "./components/AvatarSelectionStep";
import { PersonalDetailsStep } from "./components/PersonalDetailsStep";
import { PinSetupStep } from "./components/PinSetupStep";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
});

interface WizardData {
    avatar: string | null;
    fullName: string;
    phone: string;
    dob: string;
    pin: string;
    confirmPin: string;
}

const TOTAL_STEPS = 3;

export default function SetupWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<WizardData>({
        avatar: null,
        fullName: "",
        phone: "",
        dob: "",
        pin: "",
        confirmPin: "",
    });

    const updateData = (newData: Partial<WizardData>) => {
        setData((prev) => ({ ...prev, ...newData }));
    };

    const handleNext = () => {
        if (step === TOTAL_STEPS) {
            // Final Submit
            console.log("Submitting:", data);
            router.push("/dummydash");
            return;
        }
        setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((prev) => prev - 1);
        } else {
            router.back();
        }
    };

    const getButtonText = () => {
        if (step === 1) return "Continue with the image";
        if (step === 2) return "Continue";
        if (step === 3) return "Complete Profile";
        return "Continue";
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <AvatarSelectionStep />;
            case 2:
                return <PersonalDetailsStep data={data} update={updateData} />;
            case 3:
                return <PinSetupStep data={data} update={updateData} />;
            default:
                return null;
        }
    };

    return (
        <div className={`relative min-h-screen w-full overflow-hidden bg-[#F0F8FF] flex items-center justify-center p-4 ${poppins.className}`}>
            <BackgroundAnimation />
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-20 text-[#018FFF] hover:bg-[#E6F4FF] p-2 rounded-full transition-colors"
            >
                <ArrowLeft size={24} />
            </button>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-[540px] bg-white/30 backdrop-blur-md rounded-[24px] shadow-xl border border-black p-6 md:p-8 flex flex-col">

                {/* Header */}
                <div className="relative flex items-center justify-center mb-6">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="absolute left-0 p-2 bg-[#F6F6F6] rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <ChevronLeft size={20} className="text-[#333]" />
                        </button>
                    )}

                    <div className="text-center">
                        <h1 className="text-[24px] font-bold text-[#000]">Profile Creation</h1>
                        <p className="text-[18px] font-medium text-[#000]">Step {step} of {TOTAL_STEPS}</p>
                    </div>

                    {/* Right */}
                    {step < TOTAL_STEPS && (
                        <button
                            onClick={handleNext}
                            className="absolute right-0 p-2 bg-[#F6F6F6] rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <ChevronRight size={20} className="text-[#333]" />
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="w-full mb-8 px-4 sm:px-10">
                    <Progress value={(step / TOTAL_STEPS) * 100} className="h-[6px]" indicatorColor="bg-[#4FF3D0]" />
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {renderStepContent()}
                    </motion.div>
                </div>

                {/* Footer / Main Button */}
                <div className="mt-8 w-full px-4 sm:px-10">
                    <Button
                        onClick={handleNext}
                        className="w-full h-[50px] bg-[#0B76FF] text-white rounded-[8px] font-bold text-[16px] hover:bg-[#0663d6] shadow-lg shadow-[#0B76FF]/20"
                    >
                        {getButtonText()}
                    </Button>
                </div>

            </div>
        </div>
    );
}
