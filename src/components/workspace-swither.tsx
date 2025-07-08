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

  const handleWorkspaceCreated = (workspace: Workspace) => {
    setWorkspaces((prev) => [...prev, workspace]);
    handleWorkspaceSwitch(workspace); // Switch to the new workspace
    toast.success(`Switched to ${workspace.name}`);
  };

  const handleWorkspaceSwitch = async (workspace: Workspace) => {
    try {
      const response = await fetch("/api/v1/user/workspace", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch workspace");
      }

      setCurrentWorkspace(workspace);
      toast.success(`Switched to ${workspace.name}`);
    } catch (error) {
      console.error("Failed to switch workspace:", error);
      toast.error("Failed to switch workspace. Please try again.");
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
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {currentWorkspace.name}
                  </span>
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
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <GalleryVerticalEnd className="size-3.5 shrink-0" />
                  </div>
                  {workspace.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setOpenDialog(true)}
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
