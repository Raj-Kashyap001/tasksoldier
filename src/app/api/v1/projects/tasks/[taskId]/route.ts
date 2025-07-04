// /api/v1/projects/tasks/[taskId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import z from "zod/v4"; // Ensure you're using the correct import for z
import { TaskPriority, TaskStatus } from "@/generated/prisma";

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

export async function PUT(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const body = await req.json();

  const schema = z.object({
    taskName: z.string().min(1).optional(), // Make optional for partial updates
    taskSummary: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(), // Add status
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(), // Add priority
    dueDate: z.string().datetime().optional().nullable(),
    assignedToId: z.string().optional().nullable(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("Invalid input for task update:", parsed.error); // Log error for debugging
    return new Response(
      JSON.stringify({ error: "Invalid input", details: parsed.error.issues }),
      {
        status: 400,
      }
    );
  }

  const { taskName, taskSummary, status, priority, dueDate, assignedToId } =
    parsed.data;

  // Only include fields that are present in the parsed data to allow partial updates
  const updateData: {
    taskName?: string;
    taskSummary?: string;
    status?: TaskStatus; // Assuming TaskStatus is defined in your types
    priority?: TaskPriority; // Assuming TaskPriority is defined in your types
    dueDate?: string | null;
    assignedToId?: string | null;
  } = {};

  if (taskName !== undefined) updateData.taskName = taskName;
  if (taskSummary !== undefined) updateData.taskSummary = taskSummary;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate;
  if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

  const task = await db.task.update({
    where: { id: params.taskId },
    data: updateData,
  });

  return Response.json({ task });
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
