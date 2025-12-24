import React, { Suspense } from "react";
import AuthLayout from "@/features/auth/layout/AuthLayout";
import VerifyForm from "@/features/auth/forms/VerifyForm";

export default function VerifyPage() {
  const images = [
    "/auth/verify.svg",
    
  ];

  return (
    <AuthLayout images={images} contentTop={123}>
      <Suspense fallback={<div className="w-full text-center">Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </AuthLayout>
  );
}
