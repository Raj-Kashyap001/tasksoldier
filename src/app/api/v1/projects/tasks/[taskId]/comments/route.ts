import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: { taskId: string } }
) {
  const { taskId } = await context.params; // ✅ await as per Next.js 15
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { content } = body;

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  try {
    const comment = await db.comment.create({
      data: {
        content,
        createdById: user.id,
        taskId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ comment });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
