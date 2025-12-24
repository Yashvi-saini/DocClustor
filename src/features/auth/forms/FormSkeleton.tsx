import { Skeleton } from "@/components/ui/skeleton";

interface FormSkeletonProps {
   inputCount?: number;
    showRememberForgot?: boolean;
    showSocialButtons?: boolean;
    showFooter?: boolean;
    showDivider?: boolean;
}

export default function FormSkeleton({
    inputCount = 2,
    showRememberForgot = false,
    showSocialButtons = false,
    showFooter = false,
    showDivider = false,
}: FormSkeletonProps) {
    return (
        <div className="w-full max-w-[520px] mx-auto">
            {/* Heading Skeleton */}
            <div className="flex flex-col gap-2 text-center md:text-left mb-6 md:mb-10">
                <Skeleton className="h-[24px] md:h-[40px] w-[200px] md:w-[300px] mx-auto md:mx-0" />
                <Skeleton className="h-[14px] md:h-[20px] w-[180px] md:w-[250px] mx-auto md:mx-0" />
            </div>

            {/* Form Skeleton */}
            <div className="flex flex-col gap-6 items-center w-full">
                <div className="w-full flex flex-col gap-6">
                    {/* Dynamic Input Fields Skeleton */}
                    {Array.from({ length: inputCount }).map((_, index) => (
                        <div key={index} className="w-full">
                            <Skeleton className="h-[50px] w-full rounded-[6px]" />
                        </div>
                    ))}

                    {/* Remember + Forgot Skeleton (Optional) */}
                    {showRememberForgot && (
                        <div className="w-full flex items-center justify-between">
                            <Skeleton className="h-[16px] w-[120px]" />
                            <Skeleton className="h-[16px] w-[130px]" />
                        </div>
                    )}
                </div>

                {/* Submit Button Skeleton */}
                <Skeleton className="h-[50px] w-full rounded-[6px] mt-2" />
                

                {/* Social Buttons Skeleton */}
                {showSocialButtons && (
                    <div className="w-full grid grid-cols-2 gap-2 md:flex md:justify-between md:gap-3">
                        <Skeleton className="h-[40px] w-full md:w-[200px] rounded-[10px]" />
                        <Skeleton className="h-[40px] w-full md:w-[200px] rounded-[10px]" />
                    </div>
                )}
            </div>

            {/* Footer Skeleton  */}
            {showFooter && (
                <div className="hidden md:block mt-4 text-center">
                    <Skeleton className="h-[14px] w-[200px] mx-auto" />
                </div>
            )}
        </div>
    );
}
