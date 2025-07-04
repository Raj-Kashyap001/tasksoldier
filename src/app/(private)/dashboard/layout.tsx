import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ToggleTheme } from "@/components/toggle-theme";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import UserProfileDropdown from "@/components/user-profile-dropdown";
import { Workspace } from "@/generated/prisma/client";
import { isAuthenticated } from "@/lib/server/auth";
import { getAuthUser } from "@/lib/server/session";
import { getUserWorkspaces } from "@/lib/server/workspace";
import { Avatar } from "@radix-ui/react-avatar";
import { Bell, User2 } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  children: Readonly<React.ReactNode>;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const loggedIn = await isAuthenticated();
  const user = await getAuthUser();
  if (!loggedIn && !user) redirect("/auth/login");
  const workspaces = await getUserWorkspaces();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar workspaces={workspaces as Workspace[]} />
      <div className="w-full">
        <nav className="flex w-full items-center justify-between  top-0 h-16 px-4 shadow z-10">
          <div className="flex gap-2 items-center">
            <SidebarTrigger />
            Tasksoldier
          </div>
          <div className="flex gap-4 items-center">
            <ToggleTheme />

            <span>
              <Bell />
            </span>

            <UserProfileDropdown user={user} />
          </div>
        </nav>
        <main>{children}</main>
      </div>
    </SidebarProvider>
  );
}
