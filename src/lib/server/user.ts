import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

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
