// TODO: Add other types here
export interface CommentUser {
  id: string;
  fullName: string;
  email: string;
  profilePictureUrl: string | null;
}

export interface CommentTask {
  id: string;
  taskName: string;
}

export interface RecentComment {
  id: string;
  content: string;
  createdAt: string; // ISO 8601 string
  task: CommentTask;
  createdBy: CommentUser;
}

// lib/types.ts
export interface NewTask {
  taskName: string;
  taskSummary?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate?: string;
  projectId: string;
  assignedToId?: string;
  assignedUserId?: string;
  workspaceId?: string;
}
