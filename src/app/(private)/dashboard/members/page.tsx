"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import InviteMemberModal from "@/components/invite-member-modal";
import MemberCard from "@/components/member-card";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  profileImage?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get("/workspaces/members");
        setMembers(res.data.members);
      } catch (err) {
        toast.error("Failed to load members.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Workspace Members"
        description="Manage your team's access and roles"
      />
      <Button onClick={() => setModalOpen(true)}>
        <Plus className="float-right h-4 w-4" />
        Invite Member
      </Button>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      {modalOpen && (
        <InviteMemberModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
