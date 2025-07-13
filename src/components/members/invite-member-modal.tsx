"use client";
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Copy, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ open, onClose }: Props) {
  const [role, setRole] = useState("MEMBER");
  const [inviteLink, setInviteLink] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchCurrentUserRole();
    }
  }, [open]);

  const fetchCurrentUserRole = async () => {
    try {
      const response = await api.get("/user/me");
      // You'll need to adjust this based on your user/me response structure
      setCurrentUserRole(response.data.role || "MEMBER");
    } catch (error) {
      console.error("Failed to fetch current user role:", error);
    }
  };

  const getAvailableRoles = () => {
    const roles = [
      { value: "MEMBER", label: "Member" },
      { value: "ADMIN", label: "Admin" },
      { value: "OWNER", label: "Owner" },
    ];

    // Filter roles based on current user's permissions
    if (currentUserRole === "MEMBER") {
      return roles.filter((r) => r.value === "MEMBER");
    } else if (currentUserRole === "ADMIN") {
      return roles.filter((r) => r.value !== "OWNER");
    }

    return roles; // OWNER can invite anyone
  };

  const generateInvite = async () => {
    try {
      setGenerating(true);
      const res = await api.post("/invite", { role });
      setInviteLink(`${window.location.origin}/invite/${res.data.token}`);
      toast.success("Invite link generated successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to generate invite link."
      );
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleClose = () => {
    setInviteLink("");
    setRole("MEMBER");
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableRoles().map((roleOption) => (
                  <SelectItem key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {inviteLink && (
            <div className="mt-4 space-y-2">
              <Label className="mb-2">Invite Link</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="px-3"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">Role: {role}</Badge>
                <p className="text-sm text-gray-500">Link expires in 7 days</p>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-2 mt-8">
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
