"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { PageHeader } from "@/components/page-header";
import { DataTableMembers } from "@/components/members/members-table";
import { RecentCommentsList } from "@/components/dashboard/recent-comments-list";
import { TaskPieChart } from "@/components/dashboard/task-pie-chart";
import { Role } from "@/generated/prisma";

interface Stats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  recentActivity: {
    label: string;
    count: number;
  }[];
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  profilePictureUrl?: string;
  role: Role;
  joinedAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, membersRes] = await Promise.all([
          api.get("/user/stats"),
          api.get("/workspace/members"),
        ]);
        setStats(statsRes.data.stats);
        setMembers(membersRes.data.members);
      } catch (error) {
        setStats(null);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Dashboard"
          description="Overview of your activity"
          className="mb-3"
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium ">
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold ">
                    {stats?.totalTasks || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium ">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.completedTasks || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium ">
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats?.inProgressTasks || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium ">
                    Open Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-orange-600">
                    {(stats?.totalTasks ?? 0) -
                      (stats?.completedTasks ?? 0) -
                      (stats?.inProgressTasks ?? 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Members Table - Takes 2/3 of the space on large screens */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    <DataTableMembers data={members} />
                  </CardContent>
                </Card>
              </div>

              {/* Pie Chart - Takes 1/3 of the space on large screens */}
              <div className="lg:col-span-1">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Task Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center">
                    <TaskPieChart
                      completed={stats?.completedTasks ?? 0}
                      inProgress={stats?.inProgressTasks ?? 0}
                      total={stats?.totalTasks ?? 0}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Comments - Full width below */}
            <div className="grid grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentCommentsList />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
