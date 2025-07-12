"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/axios";

export default function InvitePage() {
  const router = useRouter();
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.get("/user/me");
        if (res.data) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push(`/login?redirect=/invite/${token}`);
        }
      } catch (err) {
        setIsAuthenticated(false);
        router.push(`/login?redirect=/invite/${token}`);
      }
    }
    checkAuth();
  }, [router, token]);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/invite/${token}/accept`);
      toast.success("Successfully joined workspace!");
      router.push(`/workspace/${res.data.workspaceId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to accept invite");
      toast.error(err.response?.data?.error || "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/invite/${token}/reject`);
      toast.success("Invite rejected successfully");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reject invite");
      toast.error(err.response?.data?.error || "Failed to reject invite");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirecting to login
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Workspace Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <p className="mb-4">You have been invited to join a workspace.</p>
          <div className="flex space-x-4">
            <Button onClick={handleAccept} disabled={loading}>
              {loading ? "Processing..." : "Accept Invite"}
            </Button>
            <Button onClick={handleReject} disabled={loading} variant="outline">
              {loading ? "Processing..." : "Reject Invite"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
