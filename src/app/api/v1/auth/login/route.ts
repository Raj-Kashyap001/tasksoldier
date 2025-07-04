import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/definitions";
import { comparePassword } from "@/lib/utils";

import { HttpStatus } from "@/lib/enums";
import { ApiErrorResponse } from "@/lib/server/error-handler";
import { createSession } from "@/lib/server/session";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return ApiErrorResponse(HttpStatus.BAD_REQUEST, "Invalid input");
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    return ApiErrorResponse(
      HttpStatus.UNAUTHORIZED,
      "Invalid email or password"
    );
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return ApiErrorResponse(
      HttpStatus.UNAUTHORIZED,
      "Invalid email or password"
    );
  }

  await createSession(user.id);

  return NextResponse.json({ success: true }, { status: HttpStatus.OK });
}
