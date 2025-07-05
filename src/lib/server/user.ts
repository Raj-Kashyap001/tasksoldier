import { User } from "@/generated/prisma";
import { db } from "@/lib/prisma";
import { api } from "@/lib/axios";

interface UpdateUserInput {
  fullName?: string;
  profilePictureUrl?: string;
  bio?: string;
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  return await db.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      bio: true,
      profilePictureUrl: true,
      updatedAt: true,
    },
  });
}

export async function getUserStats(userId: string) {
  const tasks = await db.task.findMany({
    where: {
      project: {
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    },
    select: {
      status: true,
      createdAt: true,
    },
  });

  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const commentCount = await db.comment.count({
    where: { createdById: userId },
  });

  const notificationCount = await db.notification.count({
    where: { userId },
  });

  const projectCount = await db.project.count({
    where: {
      workspace: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
  });

  return {
    totalTasks: tasks.length,
    completedTasks,
    inProgressTasks,
    recentActivity: [
      { label: "Comments", count: commentCount },
      { label: "Notifications", count: notificationCount },
      { label: "Projects", count: projectCount },
    ],
  };
}

// Other user-related functions...

/**
 * Updates the current workspace for a user.
 * @param userId - The ID of the user.
 * @param workspaceId - The ID of the new workspace.
 * @returns The updated user object.
 */
export async function updateUserCurrentWorkspace(
  userId: string,
  workspaceId: string
): Promise<User> {
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { currentWorkspaceId: workspaceId },
    });
    return updatedUser;
  } catch (error) {
    console.error("Failed to update current workspace:", error);
    throw new Error("Could not update user's current workspace.");
  }
}

import z from "zod/v4";

const settingsSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.email("Invalid email address"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export async function updateUserSettings(data: SettingsFormValues) {
  const res = await api.patch("/api/v1/user/update", data);
  return res.data;
}
