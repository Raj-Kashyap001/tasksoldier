"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  workspaceId: string;
  currentName: string;
}

export default function EditWorkspaceNameForm({
  workspaceId,
  currentName,
}: Props) {
  const [name, setName] = useState(currentName);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleUpdate = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/v1/workspace/update", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workspaceId, name }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Something went wrong");
        }

        toast.success("Workspace name updated");
        setOpen(false);
        location.reload();
      } catch (error: any) {
        toast.error(error.message || "Failed to update");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Workspace Name</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
          />
          <Button
            onClick={handleUpdate}
            disabled={pending || name.trim() === ""}
          >
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
