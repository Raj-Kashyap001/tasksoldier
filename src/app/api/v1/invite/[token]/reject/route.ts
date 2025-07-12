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

    // Delete the invite and log the rejection
    await db.$transaction([
      db.invite.delete({
        where: { token },
      }),
      // Create activity log for inviter
      db.activityLog.create({
        data: {
          userId: invite.invitedById,
          action: `User ${user.id} rejected invite to workspace ${invite.workspaceId}`,
          entityType: "INVITE",
          entityId: invite.id,
        },
      }),
      // Create activity log for invitee
      db.activityLog.create({
        data: {
          userId: user.id,
          action: `Rejected invite to workspace ${invite.workspaceId}`,
          entityType: "INVITE",
          entityId: invite.id,
        },
      }),
    ]);

    return NextResponse.json({ message: "Invite rejected successfully" });
  } catch (error) {
    console.error("Error rejecting invite:", error);
    return NextResponse.json(
      { error: "Failed to reject invite" },
      { status: 500 }
    );
  }
}
