import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse } from "@/lib/server/error-handler";
import { hashPassword } from "@/lib/utils";
import { signupSchema } from "@/lib/definitions";
import { createSession } from "@/lib/server/session";
import { HttpStatus } from "@/lib/enums";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return ApiErrorResponse(HttpStatus.BAD_REQUEST, "Input");
    }

    const { fullName, email, password } = parsed.data;

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return ApiErrorResponse(HttpStatus.CONFLICT, "Email");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });

    await createSession(newUser.id);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          onboarded: newUser.onboarded,
        },
      },
      { status: HttpStatus.CREATED }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
