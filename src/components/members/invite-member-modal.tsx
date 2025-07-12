"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/axios";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ open, onClose }: Props) {
  const [role, setRole] = useState("MEMBER");
  const [inviteLink, setInviteLink] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateInvite = async () => {
    try {
      setGenerating(true);
      const res = await api.post("/workspace/invite", { role });

      setInviteLink(`${window.location.origin}/invite/${res.data.token}`);
    } catch {
      toast.error("Failed to generate invite link.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Team Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inviteLink && (
            <div>
              <Label>Invite Link</Label>
              <Input value={inviteLink} readOnly />
            </div>
          )}

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => toast.info("Email invites coming soon!")}
            >
              Invite by Email
            </Button>
            <Button onClick={generateInvite} disabled={generating}>
              {generating ? "Generating..." : "Generate Link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
