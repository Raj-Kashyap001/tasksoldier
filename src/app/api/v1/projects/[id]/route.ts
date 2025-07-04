// /src/app/api/v1/projects/[id]/route.ts

import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  try {
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        workspaceId: user.currentWorkspaceId!,
      },
      include: {
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            comments: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error("[PROJECT_DETAIL_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
