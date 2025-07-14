import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/definitions";
import { comparePassword } from "@/lib/utils";

import { HttpStatus } from "@/lib/enums";
import { createSession } from "@/lib/server/session";
import { z } from "zod/v4";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: z.prettifyError(parsed.error) },
      {
        status: HttpStatus.BAD_REQUEST,
      }
    );
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    return NextResponse.json(
      { message: "No Input Provided!" },
      {
        status: HttpStatus.BAD_REQUEST,
      }
    );
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return NextResponse.json(
      { message: "Invalid Credentials!" },
      {
        status: HttpStatus.UNAUTHORIZED,
      }
    );
  }

  await createSession(user.id);

  return NextResponse.json({ success: true }, { status: HttpStatus.OK });
}
