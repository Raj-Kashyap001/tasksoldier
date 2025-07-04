import { AccessLevel, Role, Workspace } from "@/generated/prisma";
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
            role: Role.OWNER,
            accessLevel: AccessLevel.OWNER,
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
        // Find workspaces where there is a member record
        // associated with the current user's ID.
        members: {
          some: {
            userId: currentUser.id,
          },
        },
      },
      // Select only the fields needed for the Workspace interface
      select: {
        id: true,
        name: true,
      },
      // You might want to order them, e.g., by name or creation date
      orderBy: {
        name: "asc",
      },
    });
    return workspaces;
  } catch (error) {
    console.error("Failed to fetch user workspaces:", error);
    // Depending on your error handling strategy, you might re-throw the error
    // or return an empty array. Returning an empty array is safer for UI display.
    return [];
  }
}
