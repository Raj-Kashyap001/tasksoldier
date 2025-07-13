"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Workspace {
  id: string;
  name: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
}

interface Props {
  workspaces: Workspace[];
  currentWorkspaceId?: string;
}

export default function WorkspaceManagementTable({
  workspaces,
  currentWorkspaceId,
}: Props) {
  const router = useRouter();
  const [state, setState] = useState(() =>
    workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      saving: false,
      deleting: false,
    }))
  );

  const updateState = (
    id: string,
    updates: Partial<(typeof state)[number]>
  ) => {
    setState((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, ...updates } : ws))
    );
  };

  const handleUpdate = async (workspaceId: string, name: string) => {
    if (!name.trim()) return toast.error("Workspace name cannot be empty.");
    updateState(workspaceId, { saving: true });

    try {
      await api.patch("/workspace/update", { workspaceId, name });
      toast.success("Workspace renamed");
      router.refresh();
    } catch {
      toast.error("Failed to rename workspace");
    } finally {
      updateState(workspaceId, { saving: false });
    }
  };

  const handleDelete = async (workspaceId: string) => {
    if (!confirm("Are you sure you want to delete this workspace?")) return;

    updateState(workspaceId, { deleting: true });
    try {
      await api.delete("/workspace/delete", {
        data: { workspaceId },
      });
      toast.success("Workspace deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete workspace");
    } finally {
      updateState(workspaceId, { deleting: false });
    }
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workspaces.map((ws) => {
            const row = state.find((s) => s.id === ws.id)!;

            return (
              <TableRow key={ws.id}>
                <TableCell>
                  <Input
                    className="w-full"
                    value={row.name}
                    disabled={ws.role !== "ADMIN"}
                    onChange={(e) =>
                      updateState(ws.id, { name: e.target.value })
                    }
                  />
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant={
                      ws.role === "ADMIN"
                        ? "default"
                        : ws.role === "MEMBER"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {ws.role}
                  </Badge>
                </TableCell>

                <TableCell>
                  {ws.id === currentWorkspaceId ? (
                    <Badge className="bg-green-400">Current</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">–</span>
                  )}
                </TableCell>

                <TableCell className="flex gap-2 justify-end flex-wrap">
                  <Link href={`/dashboard/settings`}>
                    <Button variant="outline" size="sm">
                      <Settings className="size-4 mr-1" />
                      Settings
                    </Button>
                  </Link>

                  {ws.role === "ADMIN" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={row.saving}
                        onClick={() => handleUpdate(ws.id, row.name)}
                      >
                        <Save className="size-4 mr-1" />
                        Save
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={row.deleting}
                        onClick={() => handleDelete(ws.id)}
                      >
                        <Trash2 className="size-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
