"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface InviteData {
  workspaceName: string;
  invitedBy: string;
  role: string;
  createdAt: string;
}

interface Props {
  token: string;
  currentUser: any;
}

export default function InviteAcceptance({ token, currentUser }: Props) {
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchInvite();
  }, [token]);

  const fetchInvite = async () => {
    try {
      const response = await api.get(`/invite/${token}`);
      setInvite(response.data.invite);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch invite");
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async () => {
    try {
      setAccepting(true);
      await api.post(`/invite/${token}`);
      toast.success("Successfully joined the workspace!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to accept invite");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invite) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Invite not found</p>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Invitation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">You've been invited to join</p>
          <p className="text-lg font-semibold">{invite.workspaceName}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Invited by</p>
          <p className="font-medium">{invite.invitedBy}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Role</p>
          <Badge variant={invite.role === "OWNER" ? "default" : "secondary"}>
            {invite.role}
          </Badge>
        </div>

        <div className="pt-4">
          <p className="text-sm text-gray-600 mb-2">
            Logged in as: {currentUser?.fullName} ({currentUser?.email})
          </p>
          <Button
            onClick={acceptInvite}
            disabled={accepting}
            className="w-full"
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
