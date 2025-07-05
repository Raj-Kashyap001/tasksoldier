// src/app/api/v1/user/me/route.ts
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/session";
import { HttpStatus } from "@/lib/enums";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    currentWorkspaceId: user.currentWorkspaceId,
  });
}
