import { z } from "zod/v4";

export const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const onboardingSchema = z.object({
  workspaceName: z
    .string()
    .min(2, "Workspace Name must be atleast 2 character long"),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
export type LoginData = z.infer<typeof loginSchema>;
