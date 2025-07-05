import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/session";
import { updateUser } from "@/lib/server/user";
import { HttpStatus } from "@/lib/enums";
import { ApiErrorResponse } from "@/lib/server/error-handler";
import { updateUserSchema } from "@/lib/definitions";
import { z } from "zod/v4";

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return ApiErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const json = await req.json();
  const parsed = updateUserSchema.safeParse(json);

  if (!parsed.success) {
    return ApiErrorResponse(HttpStatus.BAD_REQUEST, "Invalid input");
  }

  try {
    const updated = await updateUser(user.id, parsed.data);
    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    return ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Update failed");
  }
}
