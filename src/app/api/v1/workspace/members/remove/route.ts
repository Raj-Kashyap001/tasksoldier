import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId } = await req.json();
  const workspaceId = user.currentWorkspaceId;

  if (!workspaceId || !memberId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    // Don't allow removing yourself
    const self = await db.workspaceMember.findFirst({
      where: { id: memberId, userId: user.id },
    });

    if (self) {
      return NextResponse.json(
        { error: "You cannot remove yourself" },
        { status: 400 }
      );
    }

    await db.workspaceMember.delete({
      where: {
        id: memberId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("REMOVE_MEMBER_ERROR", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
