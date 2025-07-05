import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

import { HttpStatus } from "@/lib/enums";
import { ApiErrorResponse } from "@/lib/server/error-handler";
import { getAuthUser } from "@/lib/server/session";
import { updateUserCurrentWorkspace } from "@/lib/server/user";

// Zod schema to validate the request body
const updateWorkspaceSchema = z.object({
  workspaceId: z.string().cuid(),
});

export async function PUT(req: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthUser();
    if (!user) {
      return ApiErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }

    // Validate the request body
    const json = await req.json();
    const parsed = updateWorkspaceSchema.safeParse(json);

    if (!parsed.success) {
      return ApiErrorResponse(HttpStatus.BAD_REQUEST, "Invalid input");
    }

    // Update the user's current workspace
    await updateUserCurrentWorkspace(user.id, parsed.data.workspaceId);

    // Return a success response
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update failed:", err);
    return ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Update failed");
  }
}
