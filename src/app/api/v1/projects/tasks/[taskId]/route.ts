import { db } from "@/lib/prisma";
import { TaskPriority, TaskStatus } from "@/generated/prisma";
import { getAuthUser } from "@/lib/server/session";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatus } from "@/lib/enums";
import z from "zod/v4";

// GET task details with comments + assigned user
export async function GET(
  _: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;

  try {
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            createdBy: {
              select: {
                id: true,
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
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
      return NextResponse.json(
        { error: "Task not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    return NextResponse.json({ task }, { status: HttpStatus.OK });
  } catch (error) {
    console.error("[TASK_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT to update task
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;

  const body = await req.json();

  const schema = z.object({
    taskName: z.string().min(1).optional(),
    taskSummary: z.string().optional(),
    status: z.enum(TaskStatus).optional(),
    priority: z.enum(TaskPriority).optional(),
    dueDate: z.coerce.date().nullable().optional(),
    assignedToId: z.string().nullable().optional(),
  });

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  try {
    const updated = await db.task.update({
      where: { id: taskId },
      data: parsed.data,
    });

    return NextResponse.json({ task: updated }, { status: HttpStatus.OK });
  } catch (err) {
    console.error("[TASK_UPDATE_ERROR]", err);
    return NextResponse.json(
      { error: "Update failed", detail: err },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE task (requires authentication)
export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ taskId: string }> } // ✅ Fix
) {
  const { taskId } = await context.params;
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  try {
    await db.task.delete({
      where: { id: taskId },
    });

    return new Response(null, { status: HttpStatus.NO_CONTENT });
  } catch (err) {
    console.error("[TASK_DELETE_ERROR]", err);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
