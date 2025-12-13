"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import IdentifierInput from "@/components/inputfield_ui/IdentifierInput";
import PasswordInput from "@/components/inputfield_ui/PasswordInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/authvalidations/login.schema";
import { authService } from "@/services/auth.service";


type FormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });
  const emailValue = watch("email");

  const submitForm = async (data: FormValues) => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await authService.login({
        emailOrPhoneOrUsername: data.email,
        password: data.password,
      });

      if (response && response.data) {
        
        router.push("/dummydash");
      } else {
        setApiError(response.message || "Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error("Login Error", error);
      setApiError(error.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[610px] mx-auto">
      {/* Heading */}
      <div className="flex flex-col gap-[6px] text-center md:text-left">
        <h1 className="text-[24px] leading-[32px] md:text-[44px] md:leading-[52px] font-[700] text-[#000]">
          <span className="md:hidden">Welcome Back!</span>
          <span className="hidden md:inline">Welcome Back</span>
        </h1>
        <div className="text-[14px] leading-[20px] md:text-[24px] md:leading-[36px] font-[500] text-[#6B6B6B]">
          {/* Mobile Subtext */}
          <span className="md:hidden">
            Create a new account?
            <a href="/signup" className="ml-1 text-[#0B76FF] font-[700] hover:underline">Sign Up</a>
          </span>
          {/* Desktop Subtext */}
          <span className="hidden md:inline">Log In to your account</span>
        </div>
      </div>

      {/* Form */}
      <form
        className="mt-[30px] flex flex-col gap-[30px] items-center w-full flex-1"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(submitForm)}
      >
        <div className="w-full flex flex-col gap-[30px]">
          {/* Identifier (Email) with floating label */}
          <IdentifierInput
            name="email"
            label="Enter Email"
            type="email"
            register={register("email")}
            error={errors.email?.message}
            value={emailValue}
          />

          {/* Password */}
          <PasswordInput
            name="password"
            label="Enter Password"
            register={register("password")}
            error={errors.password?.message}
            value={watch("password")}
            maxLength={20}
          />

          {/* Remember + Forgot */}
          <div className="w-full flex items-center justify-between">
            <label className={`flex items-center gap-[10px] text-[14px] font-[500] text-[#6B6B6B]`}>
              <input type="checkbox" className="accent-[#0B76FF] w-[16px] h-[16px]" />
              Remember Me
            </label>
            <a href="/forgot-password" className={`text-[14px] font-[500] text-[#6B6B6B] hover:underline`}>Forgot Password ?</a>
          </div>
        </div>

        {apiError && (
          <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {apiError}
          </div>
        )}

        {/* Submit - Order last on mobile */}
        <button
          type="submit"
          disabled={loading}
          className={`order-last md:order-none mt-auto h-[47px] w-full rounded-[6px] bg-[#0B76FF] text-white text-[18px] font-[700] hover:bg-[#0663d6] transition-colors disabled:opacity-70`}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        {/* Divider */}
        <div className={`w-full flex items-center gap-3 text-[14px] text-[#6B6B6B]`}>
          <div className="h-px flex-1 bg-[#E6E6E6]" />
          <span>Or Log in With</span>
          <div className="h-px flex-1 bg-[#E6E6E6]" />
        </div>

        {/* Social buttons */}
        <div className="w-full grid grid-cols-2 gap-2 md:flex md:justify-between md:gap-[14px]">
          <button
            type="button"
            onClick={() => authService.initiateGoogleOAuth()}
            className={`h-[47px] w-full md:w-[296px] rounded-[12px] border border-[#999999] bg-white inline-flex items-center justify-center gap-[6px] md:gap-[10px] px-2 md:px-[16px] text-[12px] sm:text-[14px] font-[500] text-[#737373]`}
          >
            <Image src="/google.svg" alt="Google" width={24} height={24} className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Login with Google</span>
          </button>

          <button
            type="button"
            onClick={() => authService.initiateGithubOAuth()}
            className={`h-[47px] w-full md:w-[296px] rounded-[12px] border border-[#999999] bg-white inline-flex items-center justify-center gap-[6px] md:gap-[10px] px-2 md:px-[16px] text-[12px] sm:text-[14px] font-[500] text-[#737373]`}
          >
            <Image src="/github.svg" alt="GitHub" width={24} height={24} className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Login with Github</span>
          </button>
        </div>
      </form>

      {/* Footer */}
      <p className={`hidden md:block mt-[30px] text-center text-[18px] font-[500] text-[#000]`}>
        Create a New Account?
        <a href="/signup" className="ml-1 text-[#0B76FF] font-[700] hover:underline">Sign Up</a>
      </p>
    </div>
  );
}
