import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/session";
import { db } from "@/lib/prisma";
import { HttpStatus } from "@/lib/enums";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  let role: "ADMIN" | "MEMBER" | "VIEWER" | null = null;

  const workspaceCount = await db.workspaceMember.count({
    where: { userId: user.id },
  });

  if (user.currentWorkspaceId) {
    const membership = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: user.currentWorkspaceId,
        },
      },
      select: {
        role: true,
      },
    });

    // ✅ assign here
    role = membership?.role ?? null;
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    currentWorkspaceId: user.currentWorkspaceId,
    role,
    workspaceCount,
  });
}
