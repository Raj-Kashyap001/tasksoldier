import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: { taskId: string; commentId: string } }
) {
  const { taskId, commentId } = await context.params; // ✅ Async param access (Next.js 15)
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      taskId: true,
      createdById: true,
    },
  });

  if (!existing || existing.taskId !== taskId) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (existing.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.comment.delete({
    where: { id: commentId },
  });

  return NextResponse.json({ success: true });
}
