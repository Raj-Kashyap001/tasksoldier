"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import InviteMemberModal from "@/components/invite-member-modal";
import { toast } from "sonner";
import { MemberRow } from "@/components/member-row";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";

interface Member {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  profilePictureUrl?: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  accessLevel: "OWNER" | "MEMBER" | "VIEWER";
  joinedAt: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/user/me");
        setCurrentUserId(userRes.data.id);

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
    newRole: "ADMIN" | "MEMBER"
  ) => {
    try {
      await api.patch("/workspace/members/role", { memberId, newRole });
      toast.success("Role updated");
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, role: newRole as Member["role"] } : m
        )
      );
    } catch {
      toast.error("Failed to update role.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Workspace Members"
        description="Manage your team's access and roles"
      />

      <Button onClick={() => setModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Invite Member
      </Button>

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
                <TableHead>Access Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  currentUserId={currentUserId}
                  onRemove={handleRemove}
                  onChangeRole={handleChangeRole}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteMemberModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
