"use client";

import React, { useState } from "react";
import OtpInput, { ResendOtpButton } from "@/features/auth/inputfield_ui/OtpInput";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { toast } from "react-hot-toast";
import FormSkeleton from "@/features/auth/forms/FormSkeleton";

export default function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "signup";

  const [email, setEmail] = React.useState("");
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  React.useEffect(() => {
    const emailFromStorage = sessionStorage.getItem("verify_email");

    if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // If no email found in Storage, redirect away
      router.push("/login");
    }

    //  skeleton loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [resendKey, setResendKey] = React.useState<number | null>(null);
  const [cooldownActive, setCooldownActive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);


  React.useEffect(() => {
    if (otp.length === 0) {
      setError(null);
    }
  }, [otp]);

  const onComplete = (code: string) => {
    setOtp(code);
  };

  /* Throttle  */
  const lastVerifyTime = React.useRef(0);
  const lastResendBtnTime = React.useRef(0);

  const verify = async (codeOverride?: string) => {
    const now = Date.now();
    if (now - lastVerifyTime.current < 2000) return;
    lastVerifyTime.current = now;

    const codeToVerify = codeOverride || otp;
    if (codeToVerify.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let response;
      if (mode === "signup") {
        // Verify Email
        response = await authService.verifyEmail({
          email: email,
          otp: codeToVerify
        });
      } else {
        const purpose = (mode === 'login' || mode === 'forgot') ? 'login' : 'register';

        response = await authService.verifyOtp({
          email: email,
          otp: codeToVerify,
          purpose: purpose as 'register' | 'login'
        });
      }

      if (response && response.success) {
        toast.success("Verification successful!");
        if (mode === "forgot") {
          await authService.setResetAuthorizedCookie();

          sessionStorage.setItem("reset_email", email);
          router.push("/reset-password");
        } else {
          // on success
          router.push("/dummydash");
        }
      } else {
        const errorMsg = response?.message || "Verification failed. Invalid OTP.";
        setError(errorMsg);
        toast.error(errorMsg);
      }

    } catch (err: any) {
      console.error("Verification error", err);
      const errorMsg = err.message || "An error occurred during verification.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const now = Date.now();
    if (now - lastResendBtnTime.current < 2000) return;
    lastResendBtnTime.current = now;

    if (!email) {
      setError("Email is missing. Cannot resend OTP.");
      return;
    }
    try {

      const purpose = (mode === 'signup') ? 'register' : 'login';
      await authService.sendOtp(purpose, email);
      toast.success("OTP Resent!");
      // Restart timer
      setResendKey(Date.now());
      setCooldownActive(true);
    } catch (err) {
      console.error("Resend OTP error", err);
      setError("Failed to resend OTP.");
      toast.error("Failed to resend OTP.");
    }
  };

  //skeleton during initial loading
  if (isInitialLoading) {
    return <FormSkeleton inputCount={0} />;
  }

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div className="flex flex-col gap-2 text-center md:text-left mb-8">
        <h1 className="text-[24px] md:text-[40px] font-[700] text-[#000]">
          Verification
        </h1>
        <p className="hidden md:block text-[14px] md:text-[20px] font-[500] text-[#6B6B6B]">
          Enter the OTP sent to {email ? email : "your email"}
        </p>
        <p className="md:hidden text-[14px] leading-[20px] font-[500] text-[#6B6B6B]">
          Verify your identity to continue. Enter the OTP we’ve sent to your registered email.
        </p>
      </div>

      <div className="flex flex-col gap-6 items-center w-full">
        <OtpInput length={6} onChange={setOtp} onComplete={onComplete} error={error} />
        {/* space for display error*/}
        <div className="w-full h-[18px]">
          {error ? (
            <p className={`text-[#FF2121] text-[12px] w-full`}>{error}</p>
          ) : null}
        </div>

        <div className="w-full flex flex-col gap-4">
          <button
            type="button"
            onClick={() => verify()}
            disabled={loading}
            className={`h-[44px] md:h-[50px] w-full rounded-[10px] bg-[#0B76FF] text-white text-[18px] font-[700] hover:bg-[#0663d6] transition-colors disabled:opacity-70`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <ResendOtpButton
            onResend={handleResend}
            seconds={30}
            startKey={resendKey}
            onCountdownEnd={() => setCooldownActive(false)}
          />
        </div>
      </div>
    </div>
  );
}
