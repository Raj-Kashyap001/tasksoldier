"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, GalleryVerticalEnd } from "lucide-react";

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
import { api } from "@/lib/axios"; // Use your custom axios instance

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
}

export function WorkspaceSwitcher({
  workspaces: initialWorkspaces,
}: WorkspaceSwitcherProps) {
  const { isMobile } = useSidebar();
  const [workspaces, setWorkspaces] =
    React.useState<Workspace[]>(initialWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] = React.useState<Workspace>(
    initialWorkspaces[0]
  );
  const [openDialog, setOpenDialog] = React.useState(false);
  const [switching, setSwitching] = React.useState(false);

  const handleWorkspaceCreated = (workspace: Workspace) => {
    setWorkspaces((prev) => [...prev, workspace]);
    handleWorkspaceSwitch(workspace); // Switch to the new workspace
    toast.success(`Switched to ${workspace.name}`);
  };

  const handleWorkspaceSwitch = async (workspace: Workspace) => {
    // Don't switch if it's the same workspace
    if (currentWorkspace.id === workspace.id) {
      return;
    }

    try {
      setSwitching(true);

      // Use your custom axios instance instead of fetch
      const response = await api.put("/user/workspace", {
        workspaceId: workspace.id,
      });

      if (response.status === 200) {
        setCurrentWorkspace(workspace);
        toast.success(`Switched to ${workspace.name}`);

        // Optional: Force a page refresh or router refresh to update the UI
        window.location.reload();
        // or use Next.js router if you prefer
        // router.refresh();
      }
    } catch (error: any) {
      console.error("Failed to switch workspace:", error);

      // Better error handling with more specific messages
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to switch workspace. Please try again.";

      toast.error(errorMessage);
    } finally {
      setSwitching(false);
    }
  };

  if (!currentWorkspace) return null;

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
                    {currentWorkspace.name}
                  </span>
                  {switching && (
                    <span className="text-xs text-muted-foreground">
                      Switching...
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto size-4 opacity-50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Available Workspaces
              </DropdownMenuLabel>

              {workspaces.map((workspace, index) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleWorkspaceSwitch(workspace)}
                  className="gap-2 p-2"
                  disabled={switching || currentWorkspace.id === workspace.id}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <GalleryVerticalEnd className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span>{workspace.name}</span>
                    {currentWorkspace.id === workspace.id && (
                      <span className="text-xs text-muted-foreground">
                        Current
                      </span>
                    )}
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}

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
