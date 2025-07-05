import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { Role } from "@/generated/prisma";

export async function PATCH(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId, newRole } = await req.json();
  const workspaceId = user.currentWorkspaceId;

  if (!memberId || !newRole || !workspaceId) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    // if (targetMember.role === "OWNER") { // TODO
    //   return NextResponse.json(
    //     { error: "Cannot change the role of the workspace owner" },
    //     { status: 403 }
    //   );
    // }
    await db.workspaceMember.update({
      where: { id: memberId },
      data: { role: newRole as Role },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("UPDATE_MEMBER_ROLE_ERROR", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
