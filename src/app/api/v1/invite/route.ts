import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { getAuthUser } from "@/lib/server/session";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await req.json();

    // Validate role
    if (!["OWNER", "ADMIN", "MEMBER"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get current workspace membership
    const currentMembership = await db.workspaceMember.findFirst({
      where: {
        userId: currentUser.id,
        workspaceId: currentUser.currentWorkspaceId!,
      },
    });

    if (!currentMembership) {
      return Response.json(
        { error: "Not a member of any workspace" },
        { status: 403 }
      );
    }

    // RBAC: Check if user can invite with the specified role
    const canInvite = checkInvitePermission(currentMembership.role, role);
    if (!canInvite) {
      return Response.json(
        {
          error: "You don't have permission to invite users with this role",
        },
        { status: 403 }
      );
    }

    // Generate invite token
    const inviteToken = uuid();

    // Create invite record
    const invite = await db.invite.create({
      data: {
        token: inviteToken,
        workspaceId: currentUser.currentWorkspaceId!,
        invitedById: currentUser.id,
        role: role as any,
      },
    });

    return Response.json(
      {
        token: invite.token,
        role: invite.role,
        workspaceId: invite.workspaceId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Invite creation error:", error);
    return Response.json({ error: "Failed to create invite" }, { status: 500 });
  }
}

// Helper function to check invite permissions
function checkInvitePermission(
  inviterRole: string,
  inviteeRole: string
): boolean {
  const roleHierarchy = {
    OWNER: 3,
    ADMIN: 2,
    MEMBER: 1,
  };

  const inviterLevel = roleHierarchy[inviterRole as keyof typeof roleHierarchy];
  const inviteeLevel = roleHierarchy[inviteeRole as keyof typeof roleHierarchy];

  // OWNER can invite anyone
  if (inviterRole === "OWNER") return true;

  // ADMIN can invite ADMIN and MEMBER, but not OWNER
  if (inviterRole === "ADMIN") return inviteeRole !== "OWNER";

  // MEMBER can only invite other MEMBERS
  if (inviterRole === "MEMBER") return inviteeRole === "MEMBER";

  return false;
}
