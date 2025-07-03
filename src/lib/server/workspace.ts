import { AccessLevel, Role } from "@/generated/prisma";
import { db } from "../prisma";

export async function createWorkspace(userId: string, workspaceName: string) {
  const existing = await db.workspaceMember.findMany({
    where: { userId },
  });

  if (existing.length > 0) {
    throw new Error("User already has a workspace.");
  }

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

export interface Workspace {
  id: string;
  name: string;
}
