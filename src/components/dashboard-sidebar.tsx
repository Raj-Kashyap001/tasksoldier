"use client";
import {
  Briefcase,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";
import { Workspace } from "@/generated/prisma";
import { WorkspaceSwitcher } from "./workspace-swither";

// Menu items.
const items = [
  {
    title: "Dashboad",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Project",
    url: "/dashboard/projects",
    icon: Briefcase,
  },
  {
    title: "My Tasks",
    url: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    title: "Members",
    url: "/dashboard/members",
    icon: Users2,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  workspaces: Workspace[];
}

export function DashboardSidebar({ workspaces }: DashboardSidebarProps) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={workspaces} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url ||
                      (item.url !== "/dashboard" &&
                        pathname.startsWith(`${item.url}/`))
                    }
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
