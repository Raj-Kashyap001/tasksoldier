// src/app/(private)/dashboard/projects/tasks/[taskId]/page.tsx

import { api } from "@/lib/axios";

export default async function TaskDetailPage({
  params,
}: {
  params: { taskId: string };
}) {
  try {
    const res = await api.get(`/projects/tasks/${params.taskId}`);
    const task = res.data.task;

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">{task.taskName}</h1>
        <p className="mt-2 text-muted-foreground">{task.taskSummary}</p>
        {/* Add more fields here */}
      </div>
    );
  } catch (err) {
    return <div className="p-6 text-red-500">Task not found</div>;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const body = await req.json();

  const updated = await db.task.update({
    where: { id: params.taskId },
    data: {
      taskName: body.taskName,
      taskSummary: body.taskSummary,
      priority: body.priority,
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    },
  });

  return NextResponse.json({ task: updated });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { taskId: string } }
) {
  await db.task.delete({
    where: { id: params.taskId },
  });

  return NextResponse.json({ success: true });
}
