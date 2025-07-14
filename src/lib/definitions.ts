import { z } from "zod/v4";

export const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const onboardingSchema = z.object({
  workspaceName: z
    .string()
    .min(2, "Workspace Name must be at least 2 character long"),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().optional(),
  profilePictureUrl: z.string().optional(),
});

export const taskSchema = z.object({
  taskName: z.string().min(1),
  taskSummary: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dueDate: z.string().optional(), // ISO date
  projectId: z.cuid(),
  assignedToId: z.cuid().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
export type LoginData = z.infer<typeof loginSchema>;
