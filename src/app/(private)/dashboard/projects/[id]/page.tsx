"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCreateModal } from "@/components/task-create-model";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

interface Task {
  id: string;
  taskName: string;
  taskSummary?: string;
  status: string;
  priority: string;
  dueDate?: string;
  comments: Comment[];
  createdAt: string;
  assignedToId: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  workspaceId: string; // ✅ Add this
  tasks: Task[];
}
export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data.project))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Loading project details...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-red-500 text-sm">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <PageHeader
          title={project.name}
          description={project.description ?? ""}
        />
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.taskName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {task.taskSummary || "No summary."}
              </p>
              <p className="text-xs">Priority: {task.priority}</p>
              <p className="text-xs">Status: {task.status}</p>
              <p className="text-xs">Comments: {task.comments?.length ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <TaskCreateModal
        open={open}
        onOpenChange={setOpen}
        workspaceId={project.workspaceId}
        projectId={project.id}
        onTaskCreated={(newTask) =>
          setProject((prev) =>
            prev ? { ...prev, tasks: [newTask, ...prev.tasks] } : prev
          )
        }
      />
    </div>
  );
}
