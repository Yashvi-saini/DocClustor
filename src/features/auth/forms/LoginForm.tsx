"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import IdentifierInput from "@/features/auth/inputfield_ui/IdentifierInput";
import PasswordInput from "@/features/auth/inputfield_ui/PasswordInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchemaType } from "@/features/auth/schema/authSchema";
import { authService } from "@/services/auth.service";
import { toast } from "react-hot-toast";
import FormSkeleton from "@/features/auth/forms/FormSkeleton";

type FormValues = LoginSchemaType;

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
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

  // Simulate initial loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  /* Throttle */
  const lastSubmitTime = React.useRef(0);

  const submitForm = async (data: FormValues) => {
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) {
      return;
    }
    lastSubmitTime.current = now;

    setLoading(true);
    setApiError(null);
    try {
      const response = await authService.login({
        emailOrPhoneOrUsername: data.email,
        password: data.password,
      });

      if (response?.success) {
        toast.success("Login Successful!");
        const user = response.data?.user;
        if (user?.profileComplete) {
          // Returning user — go straight to dashboard
          router.push("/individual/home");
        } else {
          // New user — needs to complete profile setup
          router.push("/onboarding");
        }
      } else {
        const errorMsg = response.message || "Login failed. Please check your credentials.";
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Login Error", error);
      const errorMsg = error.message || "An error occurred during login.";
      setApiError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // skeleton during initial loading
  if (isInitialLoading) {
    return (
      <FormSkeleton
        inputCount={2}
        showRememberForgot={true}
        showSocialButtons={true}
        showFooter={true}
      />
    );
  }

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Heading */}
      <div className="flex flex-col gap-2 text-center md:text-left mb-6 md:mb-10">
        <h1 className="text-[24px] md:text-[40px] font-[700] text-[#000]">
          <span className="md:hidden">Welcome Back!</span>
          <span className="hidden md:inline">Welcome Back</span>
        </h1>
        <div className="text-[14px] md:text-[20px] font-[500] text-[#6B6B6B]">
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
        className="flex flex-col gap-6 items-center w-full flex-1"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(submitForm)}
      >
        <div className="w-full flex flex-col gap-6">
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
            <label className={`flex items-center gap-2 text-[15px] font-[500] text-[#6B6B6B]`}>
              <input type="checkbox" className="accent-[#0B76FF] w-[16px] h-[16px]" />
              Remember Me
            </label>
            <a href="/forgot-password" className={`text-[15px] font-[500] text-[#6B6B6B] hover:underline`}>Forgot Password ?</a>
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
          className={`order-last md:order-none mt-2 h-[50px] w-full rounded-[6px] bg-[#0B76FF] text-white text-[18px] font-[700] hover:bg-[#0663d6] transition-colors disabled:opacity-70`}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        {/* Divider */}
        <div className={`w-full flex items-center gap-3 text-[13px] text-[#6B6B6B]`}>
          <div className="h-px flex-1 bg-[#E6E6E6]" />
          <span>Or Log in With</span>
          <div className="h-px flex-1 bg-[#E6E6E6]" />
        </div>

        {/* Social buttons */}
        <div className="w-full grid grid-cols-2 gap-2 md:flex md:justify-between md:gap-3">
          <button
            type="button"
            onClick={() => authService.initiateGoogleOAuth()}
            className={`h-[40px] w-full md:w-[200px] flex-1 rounded-[10px] border border-[#999999] bg-white inline-flex items-center justify-center gap-2 px-2 text-[12px] font-[500] text-[#737373]`}
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            <span className="truncate">SignUp with Google</span>
          </button>

          <button
            type="button"
            onClick={() => authService.initiateGithubOAuth()}
            className={`h-[40px] w-full md:w-[200px] flex-1 rounded-[10px] border border-[#999999] bg-white inline-flex items-center justify-center gap-2 px-2 text-[12px] font-[500] text-[#737373]`}
          >
            <Image src="/github.svg" alt="GitHub" width={20} height={20} className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            <span className="truncate">SignUp with Github</span>
          </button>
        </div>
      </form>

      {/* Footer */}
      <p className={`hidden md:block mt-4 text-center text-[14px] font-[500] text-[#000]`}>
        Create a New Account?
        <a href="/signup" className="ml-1 text-[#0B76FF] font-[700] hover:underline">Sign Up</a>
      </p>
    </div>
  );
}
