import { db } from "@/lib/prisma";
import { TaskPriority, TaskStatus } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod/v4";

export async function GET(
  _: Request,
  { params }: { params: { taskId: string } }
) {
  const task = await db.task.findUnique({
    where: { id: params.taskId },
    include: {
      comments: true,
      assignedTo: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePictureUrl: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const body = await req.json();

  const schema = z.object({
    taskName: z.string().min(1).optional(),
    taskSummary: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    dueDate: z.string().datetime().optional().nullable(),
    assignedToId: z.string().optional().nullable(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid input", details: parsed.error.issues }),
      { status: 400 }
    );
  }

  const { taskName, taskSummary, status, priority, dueDate, assignedToId } =
    parsed.data;

  const updateData: {
    taskName?: string;
    taskSummary?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    assignedToId?: string | null;
  } = {};

  if (taskName !== undefined) updateData.taskName = taskName;
  if (taskSummary !== undefined) updateData.taskSummary = taskSummary;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate;
  if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

  try {
    const task = await db.task.update({
      where: { id: params.taskId },
      data: updateData,
    });

    return NextResponse.json({ task });
  } catch (err) {
    console.error("Update failed:", err);
    return NextResponse.json(
      { error: "Update failed", detail: err },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { taskId: string } }
) {
  await db.task.delete({
    where: { id: params.taskId },
  });

  return new Response(null, { status: 204 });
}
