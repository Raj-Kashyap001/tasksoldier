"use client";

import * as React from "react";
import {
  ChevronsUpDown,
  Plus,
  GalleryVerticalEnd,
  Check,
  Loader2,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Workspace } from "@/generated/prisma";
import { CreateWorkspaceDialog } from "./workspace/create-workspace-dialog";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { redirect } from "next/navigation";

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
}

export function WorkspaceSwitcher({
  workspaces: initialWorkspaces,
}: WorkspaceSwitcherProps) {
  const { isMobile } = useSidebar();
  const [workspaces, setWorkspaces] =
    React.useState<Workspace[]>(initialWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] =
    React.useState<Workspace | null>(initialWorkspaces[0] || null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [switching, setSwitching] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const { data } = await api.get("/user/me");
        const current = initialWorkspaces.find(
          (ws) => ws.id === data.currentWorkspaceId
        );
        if (current) {
          setCurrentWorkspace(current);
        }
      } catch {
        toast.error("Unable to fetch current workspace.");
        // Keep the default workspace (first one) if API fails
      } finally {
        setInitializing(false);
      }
    };

    if (initialWorkspaces.length > 0) {
      fetchCurrent();
    } else {
      setInitializing(false);
    }
  }, [initialWorkspaces]);

  const handleWorkspaceCreated = (workspace: Workspace) => {
    setWorkspaces((prev) => [...prev, workspace]);
    handleWorkspaceSwitch(workspace);
  };

  const handleWorkspaceSwitch = async (workspace: Workspace) => {
    if (workspace.id === currentWorkspace?.id) return;

    try {
      setSwitching(true);
      await api.put("/user/workspace", { workspaceId: workspace.id });
      setCurrentWorkspace(workspace);
      toast.success(`Switched to ${workspace.name}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to switch workspace.";
      toast.error(msg);
    } finally {
      setSwitching(false);
    }
  };

  const handleManageWorkspace = () => {
    redirect("/dashboard/workspaces");
  };

  const displayWorkspace =
    currentWorkspace ||
    (initializing ? { name: "Fetching..." } : initialWorkspaces[0]);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                disabled={switching}
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {displayWorkspace?.name || "Select Workspace"}
                  </span>
                  {switching && (
                    <span className="text-xs text-muted-foreground">
                      Switching...
                    </span>
                  )}
                </div>
                {switching ? (
                  <Loader2 className="ml-auto size-4 animate-spin text-muted-foreground" />
                ) : (
                  <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {workspaces.length > 0
                  ? "Available Workspaces"
                  : "No Workspaces"}
              </DropdownMenuLabel>

              {workspaces.length > 0 ? (
                workspaces.map((ws, index) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => handleWorkspaceSwitch(ws)}
                    className="gap-2 p-2 relative"
                    disabled={switching || currentWorkspace?.id === ws.id}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <GalleryVerticalEnd className="size-3.5 shrink-0" />
                    </div>
                    <div className="flex flex-col">
                      <span>{ws.name}</span>
                      {currentWorkspace?.id === ws.id && (
                        <span className="text-xs text-muted-foreground">
                          Current
                        </span>
                      )}
                    </div>
                    {currentWorkspace?.id === ws.id && (
                      <Check className="ml-auto size-4 text-green-500" />
                    )}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <GalleryVerticalEnd className="size-3.5 shrink-0 opacity-50" />
                  </div>
                  <div className="text-muted-foreground">
                    No workspaces available
                  </div>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setOpenDialog(true)}
                disabled={switching}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Create Workspace
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={handleManageWorkspace}
                disabled={switching}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Settings className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Manage Workspaces
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateWorkspaceDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </>
  );
}
