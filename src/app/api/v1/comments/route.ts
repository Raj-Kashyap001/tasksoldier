import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { HttpStatus } from "@/lib/enums";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  const currentWorkspaceId = user.currentWorkspaceId;

  if (!currentWorkspaceId) {
    return NextResponse.json(
      { error: "No active workspace selected" },
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  try {
    const comments = await db.comment.findMany({
      where: {
        task: {
          project: {
            workspaceId: currentWorkspaceId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, //TODO: Only fetching 10 comments
      select: {
        id: true,
        content: true,
        createdAt: true,
        task: {
          select: {
            taskName: true,
            id: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (err) {
    console.error("[COMMENTS_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
