"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { api } from "@/lib/axios";

interface Workspace {
  id: string;
  name: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
}

interface Props {
  workspace: Workspace;
  isCurrent: boolean;
}

export default function WorkspaceCardClient({ workspace, isCurrent }: Props) {
  const [name, setName] = useState(workspace.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (!name.trim()) return toast.error("Workspace name cannot be empty.");

    setSaving(true);
    try {
      await api.patch("/workspace/update", {
        workspaceId: workspace.id,
        name,
      });

      toast.success("Workspace renamed");
      router.refresh();
    } catch (err) {
      toast.error("Failed to rename workspace");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this workspace? This action cannot be undone."
      )
    )
      return;

    setDeleting(true);
    try {
      await api.delete("/workspace/delete", {
        data: { workspaceId: workspace.id },
      });

      toast.success("Workspace deleted");
      router.refresh();
    } catch (err) {
      toast.error("Failed to delete workspace");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={workspace.role !== "ADMIN"}
            className="font-medium"
          />
          {workspace.role === "ADMIN" && (
            <Button
              size="icon"
              variant="outline"
              onClick={handleUpdate}
              disabled={saving}
            >
              <Save className="size-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {isCurrent && (
            <span className="text-green-600">Current Workspace</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex gap-2">
        <Link href={`/dashboard/settings`}>
          <Button variant="outline" className="flex-1">
            <Settings className="mr-2 size-4" />
            Settings
          </Button>
        </Link>

        {workspace.role === "ADMIN" && (
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
