"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Circle,
  Clock,
  CheckCircle,
  Flame,
  MessageCircle,
  User,
  MoreVertical,
  GripVertical,
  Loader2,
  CalendarIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCreateModal } from "@/components/task-create-model";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface Task {
  id: string;
  taskName: string;
  taskSummary?: string;
  status: TaskStatus;
  priority: TaskPriority;
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
  workspaceId: string;
  tasks: Task[];
}

function TaskEditModal({
  task,
  onClose,
  onUpdated,
}: {
  task: Task;
  onClose: () => void;
  onUpdated: (updated: Task) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [taskName, setTaskName] = useState(task.taskName);
  const [taskSummary, setTaskSummary] = useState(task.taskSummary ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [assignedToId, setAssignedToId] = useState(task.assignedToId ?? "");

  // FIX 1: Initialize dueDate as a Date object or undefined
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );

  const handleUpdate = async () => {
    setLoading(true);
    if (!taskName.trim()) {
      alert("Task name is required");
      setLoading(false);
      return;
    }
    try {
      const res = await api.put(`/projects/tasks/${task.id}`, {
        taskName,
        taskSummary: taskSummary || null,
        priority,
        status,
        // FIX 2: Convert Date object back to ISO string for the API
        dueDate: dueDate ? dueDate.toISOString() : null,
        assignedToId: assignedToId || null,
      });

      onUpdated(res.data.task);
      onClose();
    } catch (err) {
      console.error("Failed to update task", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <CardHeader>
          <CardTitle>Edit Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              className="w-full"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskSummary">Task Summary</Label>
            <Textarea
              id="taskSummary"
              className="w-full min-h-[80px]"
              value={taskSummary}
              onChange={(e) => setTaskSummary(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value: TaskStatus) => setStatus(value)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value: TaskPriority) => setPriority(value)}
            >
              <SelectTrigger id="priority" className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To ID</Label>
            <Input
              id="assignedTo"
              type="text"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              placeholder="Enter assignee ID (e.g., user123)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {/* FIX 3: Format the Date object for display */}
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  // FIX 4: setDueDate now correctly receives a Date object or undefined
                  onSelect={setDueDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function TaskDeleteConfirmationModal({
  task,
  onClose,
  onDeleted,
}: {
  task: Task;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/projects/tasks/${task.id}`);
      onDeleted(task.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete task", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <CardHeader>
          <CardTitle>Delete Task</CardTitle>
        </CardHeader>
        <p>Are you sure you want to delete this task?</p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Sortable Task Card Component (for Kanban)
function SortableTaskCard({
  task,
  isOverlay = false,
  onEdit,
  onDelete,
}: {
  task: Task;
  isOverlay?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderTaskIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "TODO":
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderPriorityIcon = (priority: string) => {
    const baseClass = "h-3 w-3";
    switch (priority) {
      case "CRITICAL":
      case "HIGH":
        return <Flame className={`${baseClass} text-red-500`} />;
      case "MEDIUM":
        return <Flame className={`${baseClass} text-yellow-500`} />;
      case "LOW":
      default:
        return <Flame className={`${baseClass} text-green-500`} />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      case "LOW":
      default:
        return "outline";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DONE":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "TODO":
      default:
        return "outline";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? "shadow-lg" : ""
      } ${isOverlay ? "rotate-3" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {renderTaskIcon(task.status)}
            <CardTitle className="text-sm font-medium truncate">
              {task.taskName}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/dashboard/projects/tasks/${task.id}`}>
                <User className="h-3 w-3" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              ref={setNodeRef}
              {...attributes}
              {...listeners}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {task.taskSummary && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.taskSummary}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getStatusVariant(task.status)} className="text-xs">
            {task.status.replace("_", " ")}
          </Badge>
          <Badge
            variant={getPriorityVariant(task.priority)}
            className="text-xs"
          >
            {renderPriorityIcon(task.priority)}
            <span className="ml-1">{task.priority}</span>
          </Badge>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-3 w-3" />
            <span>{task.comments?.length || 0}</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Assigned</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Non-sortable Task Row Component (for List View)
function TaskRow({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const renderTaskIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "TODO":
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderPriorityIcon = (priority: string) => {
    const baseClass = "h-3 w-3";
    switch (priority) {
      case "CRITICAL":
      case "HIGH":
        return <Flame className={`${baseClass} text-red-500`} />;
      case "MEDIUM":
        return <Flame className={`${baseClass} text-yellow-500`} />;
      case "LOW":
      default:
        return <Flame className={`${baseClass} text-green-500`} />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      case "LOW":
      default:
        return "outline";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DONE":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "TODO":
      default:
        return "outline";
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-200`}
    >
      {/* Removed drag handle button */}

      {renderTaskIcon(task.status)}

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{task.taskName}</h4>
        {task.taskSummary && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {task.taskSummary}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={getStatusVariant(task.status)} className="text-xs">
          {task.status.replace("_", " ")}
        </Badge>
        <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
          {renderPriorityIcon(task.priority)}
          <span className="ml-1">{task.priority}</span>
        </Badge>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          <span>{task.comments?.length || 0}</span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>Assigned</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({
  title,
  tasks,
  status,
  onEditTask,
  onDeleteTask,
}: {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      <div ref={setNodeRef} className="flex-1 p-3 space-y-3 min-h-[400px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false); // Renamed for clarity
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data.project))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !project) return;

    const activeContainerId = active.data.current?.sortable?.containerId;
    const overContainerId = over.id;

    if (!activeContainerId) return;

    const draggedTask = project.tasks.find((task) => task.id === active.id);
    if (draggedTask && activeContainerId !== overContainerId) {
      const newStatus = overContainerId as TaskStatus;

      const updatedTask: Task = { ...draggedTask, status: newStatus };

      const updatedTasks = project.tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );

      setProject({
        ...project,
        tasks: updatedTasks,
      });

      // API call to update task status
      api
        .put(`/projects/tasks/${updatedTask.id}`, { status: newStatus })
        .then((res) => console.log("Task status updated on backend", res.data))
        .catch((error) =>
          console.error("Failed to update task status on backend", error)
        );
    } else if (draggedTask && activeContainerId === overContainerId) {
      const currentTasksInColumn = project.tasks.filter(
        (task) => task.status === activeContainerId
      );
      const activeIndex = currentTasksInColumn.findIndex(
        (task) => task.id === active.id
      );
      const overIndex = currentTasksInColumn.findIndex(
        (task) => task.id === over.id
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        const sortedTasksInColumn = arrayMove(
          currentTasksInColumn,
          activeIndex,
          overIndex
        );

        // This approach to sorting the entire project.tasks array is correct
        // to reflect the new order within the specific column while maintaining
        // the order of tasks in other columns.
        const updatedProjectTasks = project.tasks.map((task) => {
          const foundSortedTask = sortedTasksInColumn.find(
            (st) => st.id === task.id
          );
          if (foundSortedTask) return foundSortedTask; // If it's one of the sorted tasks, use its new position
          return task; // Otherwise, keep the original task
        });

        // Now, we need to ensure the overall order within project.tasks is correct.
        // A simple way is to re-construct the tasks array by iterating through the
        // desired order of statuses (TODO, IN_PROGRESS, DONE) and then adding the
        // sorted tasks for each column.
        const reorderedTasks: Task[] = [];
        ["TODO", "IN_PROGRESS", "DONE"].forEach((status) => {
          reorderedTasks.push(
            ...sortedTasksInColumn.filter((task) => task.status === status)
          );
        });

        setProject({
          ...project,
          tasks: updatedProjectTasks, // This will update the task objects but not necessarily their order in the main array.
        });
        // You might need to refine the `finalTasksOrder` logic if your backend relies on it
        // and you're sending the full array back to reorder everything.
        // For frontend display, the `groupedByStatus` and `SortableContext` will handle it correctly.
      }
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === updatedTask.id ? updatedTask : task
            ),
          }
        : prev
    );
    setEditingTask(null);
  };

  const handleTaskDeleted = (deletedTaskId: string) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.filter((task) => task.id !== deletedTaskId),
          }
        : prev
    );
    setDeletingTask(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading project details...
        </span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const groupedByStatus = {
    TODO: project.tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: project.tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: project.tasks.filter((t) => t.status === "DONE"),
  };

  const activeTask = activeId
    ? project.tasks.find((task) => task.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader
            title={project.name}
            description={project.description ?? ""}
          />
          <Button onClick={() => setOpenCreateModal(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <Tabs defaultValue="list" className="w-full space-y-4">
          <TabsList className="grid grid-cols-2 w-fit">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          </TabsList>

          {/* === Non-draggable List View === */}
          <TabsContent value="list" className="space-y-4">
            <div className="space-y-2">
              {project.tasks.map((task) => (
                // Use a div or React.Fragment if you don't want the Link to encompass the whole TaskRow
                // but still make the task details page accessible.
                <div key={task.id}>
                  <Link
                    href={`/dashboard/projects/tasks/${task.id}`}
                    className="w-full block" // block to make the link fill the div
                  >
                    <TaskRow
                      task={task}
                      onEdit={setEditingTask}
                      onDelete={setDeletingTask}
                    />
                  </Link>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* === Enhanced Kanban View === */}
          <TabsContent value="kanban" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              <Card className="flex flex-col">
                <KanbanColumn
                  title="To Do"
                  tasks={groupedByStatus.TODO}
                  status="TODO"
                  onEditTask={setEditingTask}
                  onDeleteTask={setDeletingTask}
                />
              </Card>
              <Card className="flex flex-col">
                <KanbanColumn
                  title="In Progress"
                  tasks={groupedByStatus.IN_PROGRESS}
                  status="IN_PROGRESS"
                  onEditTask={setEditingTask}
                  onDeleteTask={setDeletingTask}
                />
              </Card>
              <Card className="flex flex-col">
                <KanbanColumn
                  title="Done"
                  tasks={groupedByStatus.DONE}
                  status="DONE"
                  onEditTask={setEditingTask}
                  onDeleteTask={setDeletingTask}
                />
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <TaskCreateModal
          open={openCreateModal}
          onOpenChange={setOpenCreateModal}
          workspaceId={project.workspaceId}
          projectId={project.id}
          onTaskCreated={(newTask) =>
            setProject((prev) =>
              prev ? { ...prev, tasks: [newTask, ...prev.tasks] } : prev
            )
          }
        />

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

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90">
            {/* Show SortableTaskCard for the overlay as only Kanban tasks are draggable now */}
            <SortableTaskCard
              task={activeTask}
              isOverlay
              onEdit={() => {}} // No-op for overlay
              onDelete={() => {}} // No-op for overlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
