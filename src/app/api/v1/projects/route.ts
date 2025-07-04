import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";

export async function GET() {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await db.project.findMany({
    where: {
      workspaceId: user.currentWorkspaceId!,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ projects }, { status: 200 });
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); //TODO: Use the error-handler

  const body = await req.json();
  const { name, description } = body;

  if (!name || name.length < 3) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const project = await db.project.create({
    data: {
      name,
      description,
      workspaceId: user.currentWorkspaceId!,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
