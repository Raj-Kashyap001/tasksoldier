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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Trash2, Settings, UserCog } from "lucide-react";
import EditWorkspaceNameForm from "@/components/workspace/edit-workspace-name-form";

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
        select: { role: true, accessLevel: true },
      },
    },
  });

  if (!workspace) {
    return <div className="text-red-500">Workspace not found</div>;
  }

  const userAccess = workspace.members[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-10">
      {/* Workspace Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" /> Workspace Info
          </CardTitle>
          <CardDescription>
            Details about your current workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-base font-medium">{workspace.name}</p>
            </div>
            <EditWorkspaceNameForm
              workspaceId={workspace.id}
              currentName={workspace.name}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Your Access Level</p>
              <Badge variant="secondary">{userAccess.accessLevel}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </CardTitle>
          <CardDescription>
            Customize what you get notified about.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Enable Email Notifications
          </p>
          <Switch name="emailNotifications" defaultChecked disabled />
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Activity Logs
          </CardTitle>
          <CardDescription>Clear workspace-wide activity logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log entries from the past 30 days are stored.
          </p>
          <p className="text-sm text-muted-foreground italic mt-2">Show Logs</p>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" /> User Preferences
          </CardTitle>
          <CardDescription>
            Set your personal preferences for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dark mode, notification sounds, timezone, etc.
          </p>
          <p className="text-sm text-muted-foreground italic mt-2">
            (Preferences editing coming soon)
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground pt-6">
        Some features on this page are currently unavailable and will be added
        soon.
      </p>
    </div>
  );
}
