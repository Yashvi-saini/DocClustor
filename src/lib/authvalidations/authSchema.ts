import { z } from "zod";

export const noEmoji = z
    .string()
    .refine((val) => !/\p{Extended_Pictographic}/u.test(val), {
        message: "Emojis are not allowed",
    });

export const emailField = z
    .string()
    .trim()
    .min(1, "Email is required")
    .refine((val) => !/\p{Extended_Pictographic}/u.test(val), {
        message: "Emojis are not allowed",
    })
    .email("Please enter a valid email ID");

export const usernameField = z
    .string()
    .trim()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be under 30 characters")
    .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, hyphens, and underscores"
    )
    .and(noEmoji);

export const strongPasswordField = z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be at most 20 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase character")
    .regex(/[a-z]/, "Password must contain at least one lowercase character")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
    )
    .and(noEmoji);

export const simplePasswordField = z
    .string()
    .min(1, "Password is required")
    .max(20, "Password must be at most 20 characters")
    .and(noEmoji);

export const confirmPasswordField = z
    .string()
    .min(1, "Confirm Password is required")
    .max(20, "Password must be at most 20 characters")
    .and(noEmoji);

export const otpField = z
    .string()
    .trim()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only numbers")
    .and(noEmoji);

//login schema
export const loginSchema = z.object({
    email: emailField,
    password: simplePasswordField,
    rememberMe: z.boolean().optional(),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;

//signup schema
export const signupSchema = z
    .object({
        email: emailField,
        username: usernameField,
        password: strongPasswordField,
        confirmPassword: confirmPasswordField,
        agree: z.boolean().refine((val) => val === true, {
            message: "You must agree with the Terms and Policy",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Both the passwords are not same.",
        path: ["confirmPassword"],
    });
export type SignupSchemaType = z.infer<typeof signupSchema>;

//forgot schema
export const forgotPasswordSchema = z.object({
    email: emailField,
});
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

//reset schema
export const resetPasswordSchema = z
    .object({
        password: strongPasswordField,
        confirmPassword: confirmPasswordField,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Both the passwords are not same.",
        path: ["confirmPassword"],
    });
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

//verify schema
export const verifySchema = z.object({
    otp: otpField,
});
export type VerifySchemaType = z.infer<typeof verifySchema>;


export const authSchemas = {
    login: loginSchema,
    signup: signupSchema,
    forgotPassword: forgotPasswordSchema,
    resetPassword: resetPasswordSchema,
    verify: verifySchema,
};


export const authFields = {
    email: emailField,
    username: usernameField,
    strongPassword: strongPasswordField,
    simplePassword: simplePasswordField,
    confirmPassword: confirmPasswordField,
    otp: otpField,
    noEmoji,
};
