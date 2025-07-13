// /api/v1/workspace/create/route.ts
import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server/session";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatus } from "@/lib/enums";
import { Role } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  const workspace = await db.workspace.create({
    data: {
      name,
      members: {
        create: {
          userId: user.id,
          role: Role.ADMIN,
        },
      },
    },
  });

  return NextResponse.json(
    { success: true, workspace },
    { status: HttpStatus.CREATED }
  );
}
