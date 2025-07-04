"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { formatISO } from "date-fns";
import type { NewTask } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  projectId: string;
  workspaceId: string; // 👈 Add this,
  onTaskCreated?: (task: any) => void;
}

interface WorkspaceMember {
  id: string; // WorkspaceMember.id
  fullName: string;
  userId: string; // User.id
}

export function TaskCreateModal({
  open,
  onOpenChange,
  projectId,
  workspaceId,
  onTaskCreated,
}: Props) {
  const [form, setForm] = useState({
    taskName: "",
    taskSummary: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    assignedUserId: "",
  });

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      api
        .get("/workspace/members")
        .then((res) => setMembers(res.data.members))
        .catch(() => setMembers([]));
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const assignedMember = members.find(
        (m) => m.userId === form.assignedUserId
      );

      const payload: NewTask = {
        taskName: form.taskName,
        taskSummary: form.taskSummary,
        status: form.status as any,
        priority: form.priority as any,
        dueDate: form.dueDate ? formatISO(new Date(form.dueDate)) : undefined,
        projectId,
        assignedUserId: form.assignedUserId, // <- Send this instead
        workspaceId: workspaceId, // <- You must pass this!
      };

      const res = await api.post("/projects/tasks", payload);
      toast.success("Task created");
      onOpenChange(false);
      onTaskCreated?.(res.data.task);
      setForm({
        taskName: "",
        taskSummary: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        assignedUserId: "",
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            name="taskName"
            placeholder="Task title"
            value={form.taskName}
            onChange={handleChange}
          />
          <Textarea
            name="taskSummary"
            placeholder="Short summary"
            value={form.taskSummary}
            onChange={handleChange}
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <Input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />
          <select
            name="assignedUserId"
            value={form.assignedUserId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.fullName}
              </option>
            ))}
          </select>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
