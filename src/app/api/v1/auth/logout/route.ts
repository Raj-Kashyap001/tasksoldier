import { HttpStatus } from "@/lib/enums";
import { ApiErrorResponse } from "@/lib/server/error-handler";
import { destroyCurrentSession } from "@/lib/server/session";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const sessionToken = req.cookies.get("session")?.value;

  if (!sessionToken) {
    return ApiErrorResponse(HttpStatus.BAD_REQUEST, "No session found.");
  }

  const success = await destroyCurrentSession();

  if (!success) {
    return ApiErrorResponse(HttpStatus.EXPECTATION_FAILED, "User Logout");
  }

  return NextResponse.json({ success: true }, { status: HttpStatus.OK });
}
