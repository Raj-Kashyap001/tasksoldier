// app/api/v1/user/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse } from "@/lib/server/error-handler";
import { expireSessionCookie, getAuthUser } from "@/lib/server/session"; // Import the new function
import { db } from "@/lib/prisma";
import { HttpStatus } from "@/lib/enums";

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return ApiErrorResponse(
        HttpStatus.UNAUTHORIZED,
        "Authentication required."
      );
    }

    // Start a transaction to ensure atomicity
    await db.$transaction(async (tx) => {
      // 1. Delete associated sessions for the user
      await tx.session.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // 2. Delete the user
      // Prisma will automatically handle cascading deletes if you've set up
      // onDelete: Cascade on related models in your schema.
      // If you haven't, you might need to manually delete related records
      // (e.g., Comments, Notifications, ActivityLogs, WorkspaceMember entries)
      // *before* deleting the user, unless Prisma relations handle them.
      // Based on your schema, onDelete: Cascade is set for Session, but not all relations.
      // For example, Notification and ActivityLog have onDelete: Cascade for user relation.
      // Comments has onDelete: SetNull for createdById, so no direct cascade on user delete.
      // WorkspaceMember has onDelete: Cascade for userId.
      // You should verify all relations.
      // If a relation like "currentWorkspace" on User has SetNull, that's fine.
      // The issue could be if a relation is NOT SetNull/Cascade and a record exists.

      await tx.user.delete({
        where: {
          id: user.id,
        },
      });
    });

    // NOW: Destroy the current session cookie on the client side.
    // The database entry has already been deleted in the transaction above.
    await expireSessionCookie();

    return NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully.",
      },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    console.error("Account deletion error:", error);
    // Log the full error to get more context on the 500.
    // In production, avoid sending detailed error info to the client.
    return ApiErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete account. Please try again later."
    );
  }
}
