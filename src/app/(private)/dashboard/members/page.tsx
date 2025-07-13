"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import InviteMemberModal from "@/components/members/invite-member-modal";
import { toast } from "sonner";
import { MemberRow } from "@/components/members/member-row";
import { getAvailableRoles, checkInvitePermission } from "@/lib/roles";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { canInviteMembers } from "@/lib/permissions";

interface Member {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  profilePictureUrl?: string;
  role: "VIEWER" | "MEMBER" | "ADMIN";
  joinedAt: string;
}

interface CurrentUser {
  id: string;
  role: "VIEWER" | "MEMBER" | "ADMIN";
  workspaceCount: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/user/me");
        setCurrentUser({
          id: userRes.data.id,
          role: userRes.data.role,
          workspaceCount: userRes.data.workspaceCount,
        });

        const memberRes = await api.get("/workspace/members");
        setMembers(memberRes.data.members);
      } catch (err) {
        toast.error("Failed to load members.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRemove = async (memberId: string) => {
    try {
      await api.post("/workspace/members/remove", { memberId });
      toast.success("Member removed");
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      toast.error("Failed to remove member.");
    }
  };

  const handleChangeRole = async (
    memberId: string,
    newRole: "VIEWER" | "MEMBER" | "ADMIN"
  ) => {
    try {
      await api.patch("/workspace/members/role", { memberId, newRole });
      toast.success("Role updated");
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const handleLeaveWorkspace = async () => {
    try {
      await api.post("/workspace/leave");
      toast.success("Left workspace");
      // Redirect to dashboard or workspace selection
      window.location.href = "/dashboard";
    } catch {
      toast.error("Failed to leave workspace.");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Workspace Members"
        description="Manage your team's access and roles"
      />

      {canInviteMembers(currentUser.role) && (
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  onRemove={handleRemove}
                  onChangeRole={handleChangeRole}
                  onLeaveWorkspace={() => setLeaveDialogOpen(true)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteMemberModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              {currentUser.workspaceCount <= 1 ? (
                <span className="text-red-600 font-medium">
                  You cannot leave your only workspace. Please join or create
                  another workspace first.
                </span>
              ) : (
                <>
                  Are you sure you want to leave this workspace? You’ll lose
                  access to all its projects and tasks.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleLeaveWorkspace}
              className="bg-red-400 hover:bg-red-500"
              disabled={currentUser.workspaceCount <= 1}
            >
              Leave Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// -----------------------------------------------------------
