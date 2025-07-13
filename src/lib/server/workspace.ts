import { Role } from "@/generated/prisma";
import { db } from "../prisma";
import { getAuthUser } from "./session";

export async function createWorkspace(userId: string, workspaceName: string) {
  return await db.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        members: {
          create: {
            userId,
            role: Role.ADMIN,
          },
        },
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        onboarded: true,
        currentWorkspaceId: workspace.id,
      },
    });

    return workspace;
  });
}

export async function getUserWorkspaces() {
  const currentUser = await getAuthUser();

  if (!currentUser) {
    return [];
  }

  try {
    const workspaces = await db.workspace.findMany({
      where: {
        members: {
          some: {
            userId: currentUser.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        members: {
          where: { userId: currentUser.id },
          select: { role: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      role: ws.members[0].role,
    }));
  } catch (error) {
    console.error("Failed to fetch user workspaces:", error);
    return [];
  }
}
