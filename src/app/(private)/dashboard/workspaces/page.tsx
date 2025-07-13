import WorkspaceManagementTable from "@/components/workspace/workspace-management-table";
import { getAuthUser } from "@/lib/server/session";
import { getUserWorkspaces } from "@/lib/server/workspace";

export default async function ManageWorkspacesPage() {
  const workspaces = await getUserWorkspaces();
  const user = await getAuthUser();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Manage Workspaces</h1>
      <WorkspaceManagementTable
        workspaces={workspaces}
        currentWorkspaceId={user?.currentWorkspaceId ?? undefined}
      />
    </div>
  );
}
