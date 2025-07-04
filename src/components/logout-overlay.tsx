"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

export function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!open) return;

    const logout = async () => {
      setStatus("loading");
      try {
        const res = await api.delete("/auth/logout");
        if (res.status === 200) {
          setStatus("success");
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    logout();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            {status === "loading" && "Logging you out..."}
            {status === "success" && "Logged out successfully"}
            {status === "error" && "Logout failed"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-2">
          {status === "loading" && (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Please wait...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <p className="text-sm text-muted-foreground">
                Redirecting to login...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-6 w-6 text-red-500" />
              <p className="text-sm text-muted-foreground">
                Something went wrong. Please try again.
              </p>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
