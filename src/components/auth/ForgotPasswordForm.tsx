"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordSchemaType } from "@/lib/authvalidations/forgotPassword.schema";
import IdentifierInput from "@/components/inputfield_ui/IdentifierInput";
import { authService } from "@/services/auth.service";
import { toast } from "react-hot-toast";


export default function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });
  const emailValue = watch("email");

  /* Throttle  */
  const lastSubmitTime = React.useRef(0);

  const submitForm = async (data: ForgotPasswordSchemaType) => {
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;

    setLoading(true);
    setApiError(null);
    try {
      const response = await authService.sendOtp('login', data.email);

      if (response && response.success) {
        toast.success("OTP sent to your email.");
        sessionStorage.setItem("verify_email", data.email);
        router.push(`/verify?mode=forgot`);
      } else {
        const errorMsg = response.message || "Failed to send OTP. Please check the email.";
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Forgot Password Error", error);
      const errorMsg = error.message || "An error occurred.";
      setApiError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Heading */}
      <div className="flex flex-col gap-2 text-center md:text-left mb-6 md:mb-10">
        <h1 className="text-[24px] md:text-[34px] font-[700] text-[#000] whitespace-nowrap">
          Forgot Your Password?
        </h1>
        <p className="hidden md:block text-[14px] md:text-[20px] font-[500] text-[#6B6B6B]">
          Enter your account’s email
        </p>
        <p className="md:hidden text-[14px] leading-[20px] font-[500] text-[#6B6B6B]">
          Don&apos;t worry it happens to the best of us. Enter your email and we&apos;ll help you securely reset it.
        </p>
      </div>

      {/* Form */}
      <form
        className="flex flex-col gap-6 items-center w-full"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(submitForm)}
      >
        <div className="w-full">
          <IdentifierInput
            name="email"
            label="Enter Email"
            type="email"
            register={register("email")}
            error={errors.email?.message}
            value={emailValue}
          />
        </div>

        {apiError && (
          <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {apiError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`h-[44px] md:h-[50px] w-full rounded-[6px] bg-[#0B76FF] text-white text-[18px] font-[700] hover:bg-[#0663d6] transition-colors disabled:opacity-70`}
        >
          {loading ? "Sending OTP..." : "Verify Email"}
        </button>
      </form>
    </div>
  );
}
