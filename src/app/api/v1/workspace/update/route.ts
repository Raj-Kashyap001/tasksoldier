// /api/v1/workspace/update/route.ts
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, name } = await req.json();

  const workspace = await db.workspace.update({
    where: { id: workspaceId },
    data: { name },
  });

  return NextResponse.json({ success: true, workspace });
}
