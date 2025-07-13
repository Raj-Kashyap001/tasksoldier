// /api/v1/workspace/delete/route.ts
import { Role } from "@/generated/prisma";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId } = await req.json();

  // Optional: Check if user is ADMIN before deleting
  const member = await db.workspaceMember.findFirst({
    where: { userId: user.id, workspaceId, role: Role.ADMIN },
  });

  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.workspace.delete({ where: { id: workspaceId } });

  return NextResponse.json({ success: true });
}
