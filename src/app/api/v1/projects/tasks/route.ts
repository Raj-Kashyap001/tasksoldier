// /src/app/api/v1/projects/tasks

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { HttpStatus } from "@/lib/enums";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  try {
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        workspaceId: user.currentWorkspaceId || undefined,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    const tasks = await db.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        taskName: true,
        taskSummary: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        comments: {
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json({ tasks }, { status: HttpStatus.OK });
  } catch (err) {
    console.error("[PROJECT_TASKS_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch project tasks" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      taskName,
      taskSummary,
      status,
      priority,
      dueDate,
      projectId,
      assignedUserId, // 👈 from frontend (User.id)
      workspaceId, // 👈 should be passed too
    } = body;

    // 🔍 Look up the WorkspaceMember based on userId + workspaceId
    const member = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: assignedUserId,
          workspaceId: workspaceId,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Assigned user is not a member of this workspace." },
        { status: 400 }
      );
    }

    const task = await db.task.create({
      data: {
        taskName,
        taskSummary,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        projectId,
        assignedToId: member.id, // ✅ use WorkspaceMember.id
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err: any) {
    console.error("[TASK_CREATE_ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
