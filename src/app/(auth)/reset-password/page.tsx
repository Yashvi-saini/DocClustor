import AuthLayout from "@/features/auth/layout/AuthLayout";
import ResetPasswordForm from "@/features/auth/forms/ResetPasswordForm";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  const images = [
    "/auth/reset.svg",
    
  ];

  return (
    <AuthLayout images={images} contentTop={124}>
      <Suspense fallback={<div>Loading reset form...</div>}>
        <ResetPasswordForm />
        
      </Suspense>
    </AuthLayout>
  );
}
