import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  console.log("Server has pinged!");
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await req.json();
    if (!["OWNER", "ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!user.currentWorkspaceId) {
      return NextResponse.json(
        { error: "No workspace selected" },
        { status: 400 },
      );
    }

    // Verify user has permission to invite (OWNER or ADMIN)
    const workspaceMember = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: user.currentWorkspaceId,
        },
      },
    });

    if (
      !workspaceMember ||
      !["OWNER", "ADMIN"].includes(workspaceMember.role)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Generate invite
    const token = nanoid(32);
    const invite = await db.invite.create({
      data: {
        token,
        workspaceId: user.currentWorkspaceId,
        invitedById: user.id,
        role,
      },
    });

    // Log activity for inviter
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: `Created invite for workspace ${user.currentWorkspaceId} with role ${role}`,
        entityType: "INVITE",
        entityId: invite.id,
      },
    });

    return NextResponse.json({ token: invite.token });
  } catch (error) {
    console.error("Error generating invite:", error);
    return NextResponse.json(
      { error: "Failed to generate invite" },
      { status: 500 },
    );
  }
}
