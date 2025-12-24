"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordSchemaType } from "@/features/auth/schema/authSchema";
import PasswordInput from "@/features/auth/inputfield_ui/PasswordInput";
import { authService } from "@/services/auth.service";
import { toast } from "react-hot-toast";
import FormSkeleton from "@/features/auth/forms/FormSkeleton";


export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get email from sessionStorage
  const [email, setEmail] = React.useState("");
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  React.useEffect(() => {
    const emailFromStorage = sessionStorage.getItem("reset_email");

    if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      router.push("/login");
    }

    // Show skeleton
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const [apiError, setApiError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Show skeleton during initial loading
  if (isInitialLoading) {
    return <FormSkeleton inputCount={2} />;
  }

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Heading */}
      <div className="flex flex-col gap-[6px] text-center md:text-left mb-6 md:mb-12">
        <h1 className="text-[24px] md:text-[40px] font-[700] text-[#000]">
          Reset Password
        </h1>
        <p className="hidden md:block text-[24px] leading-[36px] font-[500] text-[#6B6B6B]">
          Set a new password
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
        onSubmit={handleSubmit(async (data) => {
          if (loading) return;

          setLoading(true);
          setApiError(null);
          if (!email) {
            const errorMsg = "Missing email. Please restart the reset flow.";
            setApiError(errorMsg);
            toast.error(errorMsg);
            setLoading(false);
            return;
          }
          try {
            setLoading(true);
            const resp = await authService.resetPassword({ email, password: data.password });
            if (resp && resp.success) {
              toast.success("Password reset successful!");
              document.cookie = "reset_authorized=; path=/; max-age=0"; // Delete cookie

              // Auto-Login
              try {
                const loginResp = await authService.login({
                  emailOrPhoneOrUsername: email,
                  password: data.password
                });
                if (loginResp && (loginResp.statusCode === 200 || loginResp.data)) {
                  toast.success("Logging you in...");
                  router.push("/dummydash");
                } else {

                  router.push("/login");
                }
              } catch (loginErr) {
                console.error("Auto-login failed", loginErr);
                router.push("/login");
              }

            } else {
              const errorMsg = resp?.message || "Password reset failed.";
              setApiError(errorMsg);
              toast.error(errorMsg);
            }
          } catch (e: any) {
            const errorMsg = e?.message || "An error occurred.";
            setApiError(errorMsg);
            toast.error(errorMsg);
          } finally {
            setLoading(false);
          }
        })}
      >
        {/* New password */}
        <PasswordInput
          name="password"
          label="Enter Password"
          register={register("password")}
          error={errors.password?.message}
          value={watch("password")}
          maxLength={20}
        />

        {/* Confirm password */}
        <PasswordInput
          name="confirmPassword"
          label="Confirm Password"
          register={register("confirmPassword")}
          error={errors.confirmPassword?.message}
          value={watch("confirmPassword")}
          maxLength={20}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`h-[44px] md:h-[50px] w-full rounded-[6px] bg-[#0B76FF] text-white text-[18px] font-[700] hover:bg-[#0663d6] transition-colors disabled:opacity-70`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {apiError && (
          <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {apiError}
          </div>
        )}
      </form>
    </div>
  );
}
