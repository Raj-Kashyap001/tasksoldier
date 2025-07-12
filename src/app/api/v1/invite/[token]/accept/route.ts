import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = params;

    // Find the invite
    const invite = await db.invite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 404 }
      );
    }

    // Verify the workspace exists
    const workspace = await db.workspace.findUnique({
      where: { id: invite.workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member of the workspace
    const existingMember = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: invite.workspaceId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure atomic updates
    const [workspaceMember] = await db.$transaction([
      // Create workspace membership
      db.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: invite.workspaceId,
          role: invite.role,
          accessLevel: invite.role === "OWNER" ? "OWNER" : "MEMBER",
        },
      }),
      // Delete the invite after acceptance
      db.invite.delete({
        where: { token },
      }),
      // Create activity log for inviter
      db.activityLog.create({
        data: {
          userId: invite.invitedById,
          action: `User ${user.id} accepted invite to workspace ${invite.workspaceId}`,
          entityType: "INVITE",
          entityId: invite.id,
        },
      }),
      // Create activity log for invitee
      db.activityLog.create({
        data: {
          userId: user.id,
          action: `Joined workspace ${invite.workspaceId} via invite`,
          entityType: "WORKSPACE",
          entityId: invite.workspaceId,
        },
      }),
      // Update user's current workspace
      db.user.update({
        where: { id: user.id },
        data: { currentWorkspaceId: invite.workspaceId },
      }),
    ]);

    return NextResponse.json({
      message: "Successfully joined workspace",
      workspaceId: invite.workspaceId,
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}
