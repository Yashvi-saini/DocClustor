import AuthLayout from "@/features/auth/layout/AuthLayout";
import ForgotPasswordForm from "@/features/auth/forms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const images = [
    "/auth/Forgot.svg",
   
  ];

  return (
    <AuthLayout images={images} contentTop={203}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

