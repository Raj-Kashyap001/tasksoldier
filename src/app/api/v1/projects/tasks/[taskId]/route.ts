// /api/v1/projects/tasks/[taskId]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: { taskId: string } }
) {
  const task = await db.task.findUnique({
    where: { id: params.taskId },
    include: { comments: true },
  });

  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task });
}
