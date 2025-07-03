import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/session";
import { OnboardingData, onboardingSchema } from "@/lib/definitions";
import { ApiErrorResponse } from "@/lib/server/error-handler";
import { HttpStatus } from "@/lib/enums";
import { createWorkspace } from "@/lib/server/workspace";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return ApiErrorResponse(HttpStatus.UNAUTHORIZED, "User");

    const body: OnboardingData = await req.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return ApiErrorResponse(HttpStatus.BAD_REQUEST, "Workspace name");
    }

    await createWorkspace(user.id, parsed.data.workspaceName);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return ApiErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Workspace creation"
    );
  }
}
