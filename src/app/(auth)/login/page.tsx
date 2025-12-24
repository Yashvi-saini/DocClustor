import AuthLayout from "@/features/auth/layout/AuthLayout";
import LoginForm from "@/features/auth/forms/LoginForm";

export default function LoginPage() {

  const images = [
    "/auth/Login 1.svg",
    "/auth/Login 2.svg",
    "/auth/Login 3.svg",
  ];

  return (
    <AuthLayout images={images} contentTop={63} showControls>
      <LoginForm />
    </AuthLayout>
  );
}
