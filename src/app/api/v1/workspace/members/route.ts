import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { HttpStatus } from "@/lib/enums";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus?.UNAUTHORIZED ?? 401 }
    );
  }

  const currentWorkspaceId = user.currentWorkspaceId;

  if (!currentWorkspaceId) {
    return NextResponse.json(
      { error: "No active workspace selected" },
      { status: HttpStatus?.BAD_REQUEST ?? 400 }
    );
  }

  try {
    const members = await db.workspaceMember.findMany({
      where: {
        workspaceId: currentWorkspaceId,
      },
      select: {
        id: true,
        role: true,
        accessLevel: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    const formatted = members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      fullName: m.user.fullName,
      email: m.user.email,
      profilePictureUrl: m.user.profilePictureUrl,
      role: m.role,
      accessLevel: m.accessLevel,
      joinedAt: m.joinedAt,
    }));

    return NextResponse.json({ members: formatted }, { status: 200 });
  } catch (err) {
    console.error("[WORKSPACE_MEMBERS_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch workspace members" },
      { status: HttpStatus?.INTERNAL_SERVER_ERROR ?? 500 }
    );
  }
}
