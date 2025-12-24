import AuthLayout from "@/features/auth/layout/AuthLayout";
import SignUpFormForm from "@/features/auth/forms/SignUpForm";

export default function RegisterPage() {

  const images = [
    "/auth/sign up 1.svg",
    "/auth/Sign Up 2.svg",
    "/auth/Sign Up 3.svg",
  ];

  return (
    <AuthLayout images={images} contentTop={33} showControls>
      <SignUpFormForm />
    </AuthLayout>
  );
}
