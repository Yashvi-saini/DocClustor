"use client";

import React, { useState } from "react";
import OtpInput, { ResendOtpButton } from "@/components/inputfield_ui/OtpInput";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "signup";
  const emailParam = searchParams.get("email");
  // Decode the email if it's there, although searchParams.get usually handles basic decoding,
  // explicit decoding might be safer if it was double encoded or similar, but typically get() is fine.
  const email = emailParam ? decodeURIComponent(emailParam) : "";

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
    // Optional: auto-submit on complete?
    // verify(code); 
  };

  const verify = async (codeOverride?: string) => {
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
        // Verify OTP for login or password reset
        // purpose should be 'login' or maybe 'reset_password'?
        // The Swagger purpose enum was ['register', 'login'].
        // If mode is 'forgot', we might need to check if 'login' purpose works or if there is another flow.
        // Assuming 'login' or generic verification for now.
        // Wait, verifyOtp request requires 'purpose'.
        // If mode is 'forgot', we probably used sendOtp('login') or something else?
        // Let's assume 'login' for now if not signup, or based on what triggered it.
        const purpose = (mode === 'login' || mode === 'forgot') ? 'login' : 'register';
        // Actually, if it's forgot password, usually we verify OTP then get a token to reset password.
        // But the swagger definitions for 'verifyOtp' include 'purpose'.

        response = await authService.verifyOtp({
          email: email,
          otp: codeToVerify,
          purpose: purpose as 'register' | 'login' // Force casting for now as per available types
        });
      }

      if (response && response.success) {
        // On success, navigate based on mode
        if (mode === "forgot") {
          // Assuming successful verification allows password reset
          router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${codeToVerify}`);
        } else {
          // Login or Signup success
          router.push("/dummydash");
        }
      } else {
        setError(response?.message || "Verification failed. Invalid OTP.");
      }

    } catch (err: any) {
      console.error("Verification error", err);
      setError(err.message || "An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email is missing. Cannot resend OTP.");
      return;
    }
    try {
      // Determine purpose
      const purpose = (mode === 'signup') ? 'register' : 'login';
      await authService.sendOtp(purpose, email);
      // Restart timer
      setResendKey(Date.now());
      setCooldownActive(true);
    } catch (err) {
      console.error("Resend OTP error", err);
      setError("Failed to resend OTP.");
    }
  };

  return (
    <div className="w-full max-w-[610px] mx-auto">
      <div className="flex flex-col gap-[6px] text-center md:text-left">
        <h1 className="text-[24px] leading-[32px] md:text-[44px] md:leading-[52px] font-[700] text-[#000]">
          Verification
        </h1>
        <p className="hidden md:block text-[24px] leading-[36px] font-[500] text-[#6B6B6B]">
          Enter the OTP sent to {email ? email : "your email"}
        </p>
        <p className="md:hidden text-[14px] leading-[20px] font-[500] text-[#6B6B6B]">
          Verify your identity to continue. Enter the OTP we’ve sent to your registered email.
        </p>
      </div>

      <div className="mt-[30px] flex flex-col gap-[22px] items-center w-full">
        <OtpInput length={6} onChange={setOtp} onComplete={onComplete} error={error} />
        {/* space for display error*/}
        <div className="w-full h-[18px]">
          {error ? (
            <p className={`text-[#FF2121] text-[12px] w-full`}>{error}</p>
          ) : null}
        </div>

        <div className="w-full flex flex-col gap-[14px] mt-[22px]">
          <button
            type="button"
            onClick={() => verify()}
            disabled={loading}
            className={`h-[40px] md:h-[58px] w-full rounded-[10px] bg-[#0B76FF] text-white text-[18px] font-[700] hover:bg-[#0663d6] transition-colors disabled:opacity-70`}
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
