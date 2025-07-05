import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ToggleTheme } from "@/components/toggle-theme";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import UserProfileDropdown from "@/components/user-profile-dropdown";
import { Workspace } from "@/generated/prisma/client";
import { isAuthenticated } from "@/lib/server/auth";
import { getAuthUser } from "@/lib/server/session";
import { getUserWorkspaces } from "@/lib/server/workspace";
import { Bell } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

interface DashboardLayoutProps {
  children: Readonly<React.ReactNode>;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getAuthUser();
  const loggedIn = await isAuthenticated();
  if (!loggedIn) redirect("/auth/login");
  if (!user) return null;
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const workspaces = await getUserWorkspaces();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar workspaces={workspaces as Workspace[]} />
      <div className="w-full">
        <nav className="flex w-full items-center justify-between sticky bg-primary-foreground top-0 h-16 px-4 shadow z-10">
          <div className="flex gap-2 items-center">
            <SidebarTrigger />
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
              <span className="font-semibold text-lg text-foreground">
                Tasksoldier
              </span>
            </Link>
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
