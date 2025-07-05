"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import { api } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  Circle,
  Flame,
  CalendarDays,
  Loader2,
} from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  createdBy?: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
}

interface Task {
  id: string;
  taskName: string;
  taskSummary?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  assignedTo?: {
    user: {
      fullName: string;
      profilePictureUrl?: string;
    };
  };
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (taskId) fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/tasks/${taskId}`);
      setTask(res.data.task);
    } catch (error) {
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await api.post(`/projects/tasks/${taskId}/comments`, {
        content: newComment,
      });
      setNewComment("");
      await fetchTask();
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const renderPriorityIcon = () => <Flame className="h-4 w-4" />;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DONE":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      default:
        return "outline";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Task not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {renderStatusIcon(task.status)}
          {task.taskName}
        </h1>
      </div>

      {/* Task Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Task Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.taskSummary && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                Description
              </h3>
              <p className="text-sm">{task.taskSummary}</p>
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <Badge
              variant={getStatusVariant(task.status)}
              className="flex items-center gap-1"
            >
              {renderStatusIcon(task.status)}
              {task.status.replace("_", " ")}
            </Badge>
            <Badge
              variant={getPriorityVariant(task.priority)}
              className="flex items-center gap-1"
            >
              {renderPriorityIcon()}
              {task.priority}
            </Badge>
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Assigned to:{" "}
              {task.assignedTo?.user?.fullName || (
                <span className="italic">Unassigned</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due:{" "}
              {task.dueDate
                ? format(new Date(task.dueDate), "PPP")
                : "No due date"}
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Created: {format(new Date(task.createdAt), "PPP")}
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Updated: {format(new Date(task.updatedAt), "PPP")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({task.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                size="sm"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Add Comment
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            {task.comments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No comments yet.
              </p>
            ) : (
              task.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.createdBy?.profilePictureUrl} />
                    <AvatarFallback>
                      {comment.createdBy?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {comment.createdBy?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), "PPP 'at' h:mm a")}
                      </p>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        await api.delete(
                          `/projects/tasks/${taskId}/comments/${comment.id}`
                        );
                        await fetchTask();
                        toast.success("Comment deleted");
                      } catch {
                        toast.error("Failed to delete comment");
                      }
                    }}
                    className="absolute right-0 top-0 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
