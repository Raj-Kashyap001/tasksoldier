"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import {
  Loader2,
  Circle,
  Clock,
  CheckCircle,
  Flame,
  MessageCircle,
  MoreVertical,
  GripVertical,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";

// === TYPE DEFINITIONS ===
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface Task {
  id: string;
  taskName: string;
  taskSummary?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  comments: any[];
}

// === SHARED UTILS & CONFIG ===
const statusVariant: Record<TaskStatus, "outline" | "default" | "secondary"> = {
  TODO: "outline",
  IN_PROGRESS: "default",
  DONE: "secondary",
};

const priorityVariant: Record<
  TaskPriority,
  "outline" | "secondary" | "destructive"
> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "destructive",
  CRITICAL: "destructive",
};

const renderStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case "DONE":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "IN_PROGRESS":
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-500" />;
  }
};

const renderPriorityIcon = (priority: TaskPriority) => {
  const cls = "h-3 w-3";
  const color =
    priority === "LOW"
      ? "text-green-500"
      : priority === "MEDIUM"
      ? "text-yellow-500"
      : "text-forground";
  return <Flame className={`${cls} ${color}`} />;
};

// === KANBAN COLUMN COMPONENT ===
function KanbanColumn({
  status,
  tasks,
  onEditTask,
  onDeleteTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: {
      type: "COLUMN",
      status: status,
    },
  });

  return (
    <div className="p-4 bg-muted/50 rounded-lg flex flex-col">
      <h3 className="font-semibold text-md mb-4 px-1">
        {status.replace("_", " ")}
      </h3>
      <div ref={setNodeRef} className="space-y-3 min-h-[150px] flex-1">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// === MAIN PAGE COMPONENT ===
export default function MyTaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    api
      .get("/user/tasks")
      .then((res) => setTasks(res.data.tasks))
      .catch(() => {
        toast.error("Failed to load your tasks.");
        setTasks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const originalTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    api.put(`/projects/tasks/${taskId}`, { status: newStatus }).catch(() => {
      toast.error("Failed to update task. Reverting changes.");
      setTasks(originalTasks);
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    const task = tasks.find((t) => t.id === activeId);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);

    if (!activeTask) {
      return;
    }

    // Check if we're dropping over a column
    const isOverColumn = over.data.current?.type === "COLUMN";

    if (isOverColumn) {
      const newStatus = over.data.current?.status as TaskStatus;
      if (activeTask.status !== newStatus) {
        updateTaskStatus(activeId, newStatus);
      }
    } else {
      // If dropping over another task, find which column it belongs to
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && activeTask.status !== overTask.status) {
        updateTaskStatus(activeId, overTask.status);
      }
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask(null);
    toast.success("Task updated successfully!");
  };

  const handleTaskDeleted = (deletedId: string) => {
    setTasks(tasks.filter((t) => t.id !== deletedId));
    setDeletingTask(null);
    toast.success("Task deleted successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading your tasks...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="My Tasks" description="All tasks assigned to you" />

      <Tabs defaultValue="list">
        <TabsList className="grid grid-cols-2 w-fit">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-3">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={() => setDeletingTask(task)}
              onClick={() =>
                router.push(`/dashboard/projects/tasks/${task.id}`)
              }
            />
          ))}
        </TabsContent>

        {/* Kanban Board View */}
        <TabsContent value="kanban">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map(
                (status) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasks.filter((t) => t.status === status)}
                    onEditTask={setEditingTask}
                    onDeleteTask={setDeletingTask}
                  />
                )
              )}
            </div>
            <DragOverlay>
              {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdated={handleTaskUpdated}
        />
      )}
      {deletingTask && (
        <TaskDeleteConfirmationModal
          task={deletingTask}
          onClose={() => setDeletingTask(null)}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}

// === DRAG OVERLAY COMPONENT ===
function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <Card className="cursor-grabbing shadow-2xl rotate-3 opacity-95">
      <CardHeader className="flex flex-row items-start justify-between p-3">
        <div className="flex-1 space-y-1">
          <CardTitle className="text-sm font-medium">{task.taskName}</CardTitle>
          {task.taskSummary && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.taskSummary}
            </p>
          )}
        </div>
        <div className="flex items-center">
          <div className="cursor-grab active:cursor-grabbing p-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={statusVariant[task.status]}
              className="flex items-center gap-1"
            >
              {renderStatusIcon(task.status)}
              {task.status.replace("_", " ")}
            </Badge>
            <Badge
              variant={priorityVariant[task.priority]}
              className="flex items-center gap-1"
            >
              {renderPriorityIcon(task.priority)}
              {task.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" /> {task.comments?.length ?? 0}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// === KANBAN TASK CARD COMPONENT ===
function SortableTaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "TASK",
      task: task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:shadow-lg transition-shadow"
    >
      <CardHeader className="flex flex-row items-start justify-between p-3">
        <div className="flex-1 space-y-1">
          <CardTitle className="text-sm font-medium">{task.taskName}</CardTitle>
          {task.taskSummary && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.taskSummary}
            </p>
          )}
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-500">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={statusVariant[task.status]}
              className="flex items-center gap-1"
            >
              {renderStatusIcon(task.status)}
              {task.status.replace("_", " ")}
            </Badge>
            <Badge
              variant={priorityVariant[task.priority]}
              className="flex items-center gap-1"
            >
              {renderPriorityIcon(task.priority)}
              {task.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" /> {task.comments?.length ?? 0}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// === LIST VIEW TASK ROW COMPONENT ===
function TaskRow({
  task,
  onEdit,
  onDelete,
  onClick,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{task.taskName}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant={statusVariant[task.status]}
          className="flex items-center gap-1"
        >
          {renderStatusIcon(task.status)}
          {task.status.replace("_", " ")}
        </Badge>
        <Badge
          variant={priorityVariant[task.priority]}
          className="flex items-center gap-1"
        >
          {renderPriorityIcon(task.priority)}
          {task.priority}
        </Badge>
      </div>
      {task.dueDate && (
        <span className="text-xs text-muted-foreground">
          {format(new Date(task.dueDate), "dd MMM")}
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-red-500">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// === EDIT MODAL ===
function TaskEditModal({
  task,
  onClose,
  onUpdated,
}: {
  task: Task;
  onClose: () => void;
  onUpdated: (task: Task) => void;
}) {
  const [name, setName] = useState(task.taskName);
  const [summary, setSummary] = useState(task.taskSummary || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState<string | undefined>(task.dueDate);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Task name cannot be empty.");
    setIsSaving(true);
    try {
      const res = await api.put(`/projects/tasks/${task.id}`, {
        taskName: name,
        taskSummary: summary || null,
        status,
        priority,
        dueDate: dueDate || null,
      });
      onUpdated(res.data.task);
    } catch {
      toast.error("Failed to update the task.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="name"
            placeholder="Task Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            id="summary"
            placeholder="Add a summary..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as TaskStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as TaskPriority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Input
            id="dueDate"
            type="date"
            value={dueDate ? dueDate.split("T")[0] : ""}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// === DELETE CONFIRMATION MODAL ===
function TaskDeleteConfirmationModal({
  task,
  onClose,
  onDeleted,
}: {
  task: Task;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/projects/tasks/${task.id}`);
      onDeleted(task.id);
    } catch {
      toast.error("Failed to delete the task.");
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="text-sm text-muted-foreground">
          This will permanently delete the task "{task.taskName}".
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
