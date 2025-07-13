import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/session";
import { db } from "@/lib/prisma";
import { HttpStatus } from "@/lib/enums";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();

  if (!user || !user.currentWorkspaceId) {
    return NextResponse.json(
      { error: "Unauthorized or missing current workspace" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  const workspaceCount = await db.workspaceMember.count({
    where: {
      userId: user.id,
    },
  });

  if (workspaceCount <= 1) {
    return NextResponse.json(
      { error: "You cannot leave your only workspace." },
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  // Remove the member from the current workspace
  await db.workspaceMember.delete({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: user.currentWorkspaceId,
      },
    },
  });

  // Clear current workspace if it's the one being left
  await db.user.update({
    where: { id: user.id },
    data: { currentWorkspaceId: null },
  });

  return NextResponse.json({ success: true });
}
