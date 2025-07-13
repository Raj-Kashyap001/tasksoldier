import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { token } = await params;
    const invite = await db.invite.findUnique({
      where: { token: token },
    });

    if (!invite) {
      return Response.json(
        { error: "Invalid or expired invite" },
        { status: 404 }
      );
    }

    // Optional expiration check: 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (invite.createdAt < sevenDaysAgo) {
      return Response.json({ error: "Invite has expired" }, { status: 410 });
    }

    // Fetch workspace and inviter info separately
    const [workspace, invitedBy] = await Promise.all([
      db.workspace.findUnique({
        where: { id: invite.workspaceId },
        select: { name: true },
      }),
      db.user.findUnique({
        where: { id: invite.invitedById },
        select: { fullName: true, email: true },
      }),
    ]);

    return Response.json({
      invite: {
        workspaceName: workspace?.name,
        invitedBy: invitedBy?.fullName,
        role: invite.role,
        createdAt: invite.createdAt,
      },
    });
  } catch (error) {
    console.error("Invite fetch error:", error);
    return Response.json({ error: "Failed to fetch invite" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { token } = await params;

    const invite = await db.invite.findUnique({
      where: { token: token },
    });

    if (!invite) {
      return Response.json(
        { error: "Invalid or expired invite" },
        { status: 404 }
      );
    }

    const existingMembership = await db.workspaceMember.findFirst({
      where: {
        userId: currentUser.id,
        workspaceId: invite.workspaceId,
      },
    });

    if (existingMembership) {
      return Response.json(
        {
          error: "You are already a member of this workspace",
        },
        { status: 409 }
      );
    }

    const membership = await db.workspaceMember.create({
      data: {
        userId: currentUser.id,
        workspaceId: invite.workspaceId,
        role: invite.role as any,
        accessLevel: invite.role === "OWNER" ? "OWNER" : "MEMBER",
      },
    });

    if (!currentUser.currentWorkspaceId) {
      await db.user.update({
        where: { id: currentUser.id },
        data: { currentWorkspaceId: invite.workspaceId },
      });
    }

    await db.activityLog.create({
      data: {
        userId: currentUser.id,
        action: "JOINED_WORKSPACE",
        entityType: "WORKSPACE",
        entityId: invite.workspaceId,
      },
    });

    await db.invite.delete({
      where: { token: token },
    });

    return Response.json({
      success: true,
      workspaceId: invite.workspaceId,
      role: membership.role,
    });
  } catch (error) {
    console.error("Invite acceptance error:", error);
    return Response.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}
