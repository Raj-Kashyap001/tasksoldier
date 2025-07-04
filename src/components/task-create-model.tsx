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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type { NewTask } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  projectId: string;
  workspaceId: string;
  onTaskCreated?: (task: any) => void;
}

interface WorkspaceMember {
  id: string;
  fullName: string;
  userId: string;
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
    assignedUserId: "", // This will now hold the special value for "Unassigned" or a valid user ID
  });

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open) {
      api
        .get("/workspace/members")
        .then((res) => setMembers(res.data.members))
        .catch(() => setMembers([]));

      setForm({
        taskName: "",
        taskSummary: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        assignedUserId: "", // Initialize as empty string to show placeholder
      });
      setDate(undefined);
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: NewTask = {
        taskName: form.taskName,
        taskSummary: form.taskSummary,
        status: form.status as any,
        priority: form.priority as any,
        dueDate: date ? date.toISOString() : undefined,
        projectId,
        // Send `undefined` to the backend if "Unassigned" is selected
        assignedUserId:
          form.assignedUserId === "unassigned"
            ? undefined
            : form.assignedUserId,
        workspaceId,
      };

      const res = await api.post("/projects/tasks", payload);
      toast.success("Task created successfully!");
      onOpenChange(false);
      onTaskCreated?.(res.data.task);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Name */}
          <div className="space-y-1">
            <label
              htmlFor="taskName"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Title
            </label>
            <div>
              <Input
                id="taskName"
                name="taskName"
                placeholder="Task title"
                value={form.taskName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, taskName: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Task Summary */}
          <div className="space-y-1">
            <label
              htmlFor="taskSummary"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Summary
            </label>
            <div>
              <Textarea
                id="taskSummary"
                name="taskSummary"
                placeholder="Short description"
                value={form.taskSummary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, taskSummary: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label
              htmlFor="status"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Status
            </label>
            <Select
              value={form.status}
              onValueChange={(val) => setForm((f) => ({ ...f, status: val }))}
            >
              <div>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </div>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Task Status</SelectLabel>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label
              htmlFor="priority"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Priority
            </label>
            <Select
              value={form.priority}
              onValueChange={(val) => setForm((f) => ({ ...f, priority: val }))}
            >
              <div>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </div>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Task Priority</SelectLabel>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label
              htmlFor="dueDate"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dueDate"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {date ? format(date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <label
              htmlFor="assignedUserId"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Assign To
            </label>
            <Select
              value={form.assignedUserId}
              onValueChange={(val) =>
                setForm((f) => ({ ...f, assignedUserId: val }))
              }
            >
              <div>
                <SelectTrigger id="assignedUserId">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
              </div>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Team Members</SelectLabel>
                  {/* Changed value from "" to "unassigned" */}
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.fullName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
