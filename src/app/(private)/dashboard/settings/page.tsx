import { getAuthUser } from "@/lib/server/session";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import EditWorkspaceNameForm from "@/components/workspace/edit-workspace-name-form";
import { DeleteWorkspaceButton } from "@/components/workspace/delete-workspace-button";

export default async function WorkspaceSettingsPage() {
  const user = await getAuthUser();
  if (!user || !user.currentWorkspaceId) {
    redirect("/dashboard");
  }

  const workspace = await db.workspace.findUnique({
    where: { id: user.currentWorkspaceId },
    include: {
      members: {
        where: { userId: user.id },
        select: { role: true },
      },
    },
  });

  if (!workspace) {
    return (
      <div className="p-6 text-red-500 font-bold">Workspace not found</div>
    );
  }

  const userAccess = workspace.members[0];
  const isAdmin = userAccess.role === "ADMIN";

  return (
    <div className="p-6 space-y-6">
      {/* Workspace Info */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Info</CardTitle>
          <CardDescription>
            Details about your current workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{workspace.name}</p>
            </div>

            {isAdmin && (
              <EditWorkspaceNameForm
                workspaceId={workspace.id}
                currentName={workspace.name}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Customize what you get notified about.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Switch id="email-notifications" />
          <label htmlFor="email-notifications" className="ml-2">
            Enable Email Notifications
          </label>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>Clear workspace-wide activity logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log entries from the past 30 days are stored.
          </p>
          <Button variant="outline" className="mt-2">
            Show Logs
          </Button>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>
            Set your personal preferences for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dark mode, notification sounds, timezone, etc.
          </p>
          <p className="text-sm mt-1 italic">Preferences editing coming soon</p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isAdmin && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this workspace. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteWorkspaceButton workspaceId={workspace.id} />
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground text-sm">
        Some features on this page are currently unavailable and will be added
        soon.
      </p>
    </div>
  );
}
