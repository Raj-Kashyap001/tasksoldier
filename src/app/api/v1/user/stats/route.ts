import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/session";
import { getUserStats } from "@/lib/server/user";
import { ApiErrorResponse } from "@/lib/server/error-handler";
import { HttpStatus } from "@/lib/enums";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return ApiErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized");

  try {
    const stats = await getUserStats(user.id);
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    return ApiErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Failed to fetch stats"
    );
  }
}
