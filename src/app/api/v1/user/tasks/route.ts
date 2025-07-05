import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membershipRecords = await db.workspaceMember.findMany({
    where: { userId: user.id },
    select: { id: true },
  });

  const workspaceMemberIds = membershipRecords.map((m) => m.id);

  if (workspaceMemberIds.length === 0) {
    return NextResponse.json({ tasks: [] });
  }

  const tasks = await db.task.findMany({
    where: { assignedToId: { in: workspaceMemberIds } },
    include: {
      project: { select: { name: true } },
      comments: true,
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ tasks });
}
