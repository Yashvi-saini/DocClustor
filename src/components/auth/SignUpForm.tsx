"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, type SignupSchemaType } from "@/lib/authvalidations/signup.schema";
import IdentifierInput from "@/components/inputfield_ui/IdentifierInput";
import PasswordInput from "@/components/inputfield_ui/PasswordInput";
import { authService } from "@/services/auth.service";
import { toast } from "react-hot-toast";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      agree: false,
    },
  });

  const emailValue = watch("email");
  const usernameValue = watch("username");

  /* Throttle */
  const lastSubmitTime = React.useRef(0);

  const submitForm = async (data: SignupSchemaType) => {
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;

    setLoading(true);
    setApiError(null);
    try {
      const response = await authService.register({
        email: data.email,
        username: data.username,
        password: data.password,
      });


      if (response && (response.statusCode === 201 || response.data)) {
        const email = encodeURIComponent(data.email);

        // sendOtp 'register'
        const otpResponse = await authService.sendOtp("register", data.email);

        if (otpResponse.success) {
          toast.success("Account created! Verify your email.");
          router.push(`/verify?mode=signup&email=${email}`);
        } else {

          const errorMsg = otpResponse.message || "Registration successful but failed to send OTP. Please try login or resend OTP.";
          setApiError(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        const errorMsg = response.message || "Registration failed. Please try again.";
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Registration Error", error);
      const errorMsg = error.message || "Something went wrong during registration.";
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
        <h1 className="text-[24px] md:text-[40px] font-[700] text-[#000]">
          <span className="md:hidden">Create a Account</span>
          <span className="hidden md:inline">Get Started Now!</span>
        </h1>
        <div className="text-[14px] md:text-[20px] font-[500] text-[#6B6B6B]">
          {/* Mobile Subtext */}
          <span className="md:hidden">
            Already have a account?
            <a href="/login" className="ml-1 text-[#0B76FF] font-[700] hover:underline">Login</a>
          </span>
          {/* Desktop Subtext */}
          <span className="hidden md:inline">Create your account here.</span>
        </div>
      </div>

      {/* Form */}
      <form
        className="flex flex-col gap-5 items-center w-full flex-1"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(submitForm)}
      >

        <div className="w-full flex flex-col gap-5">
          <IdentifierInput
            name="email"
            label="Enter Email"
            type="email"
            register={register("email")}
            error={errors.email?.message}
            value={emailValue}
          />

          <IdentifierInput
            name="username"
            label="Enter Username"
            type="text"
            register={register("username")}
            error={errors.username?.message}
            value={usernameValue}
            maxLength={30}
          />

          <PasswordInput
            name="password"
            label="Enter Password"
            register={register("password")}
            error={errors.password?.message}
            value={watch("password")}
            maxLength={20}
          />

          <PasswordInput
            name="confirmPassword"
            label="Confirm Password"
            register={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            value={watch("confirmPassword")}
            maxLength={20}
          />

          {/* Terms */}
          <div className="flex flex-col gap-1">
            <label className={`mt-[-4px] w-full flex items-center gap-[10px] text-[14px] font-[500] text-[#6B6B6B]`}>
              <input type="checkbox" className="accent-[#0B76FF] w-[16px] h-[16px]" {...register("agree")} />
              <span>
                I agree with the
                <a href="#" className="ml-1 text-[#0B76FF] underline-offset-2 hover:underline">
                  Terms and Policy
                </a>
              </span>
            </label>
            {errors.agree?.message ? (
              <p className="w-full text-xs text-[#FF2121]">{errors.agree.message}</p>
            ) : null}
          </div>
        </div>

        {apiError && (
          <div className="w-full p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {apiError}
          </div>
        )}

        {/* Submit Button  */}
        <button
          type="submit"
          disabled={loading}
          className={`order-last md:order-none mt-auto md:mt-[2px] h-[50px] w-full rounded-[6px] bg-[#0B76FF] text-white text-[18px] font-[700] hover:bg-[#0663d6] transition-colors disabled:opacity-70`}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        {/* Divider */}
        <div className={`w-full flex items-center gap-3 text-[13px] text-[#595959]`}>
          <div className="h-px flex-1 bg-[#595959]" />
          <span>Or Sign Up With</span>
          <div className="h-px flex-1 bg-[#595959]" />
        </div>

        {/* Social buttons - Compact Side-by-Side */}
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

      {/* Footer - Only visible on desktop now */}
      <p className={`hidden md:block mt-4 text-center text-[14px] font-[500] text-[#000]`}>
        Already have a account?
        <a href="/login" className="ml-1 text-[#0B76FF] font-[700] hover:underline">Log In</a>
      </p>
    </div>
  );
}
