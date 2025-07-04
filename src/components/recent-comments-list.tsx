// src/components/recent-comments-list.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/axios"; // Assuming your axios instance is correctly configured
import { Loader2, MessageSquare } from "lucide-react"; // MessageSquare icon for comments
import { formatDistanceToNowStrict } from "date-fns"; // For formatting dates nicely
import Link from "next/link"; // If you want to link to tasks

// Import the interfaces we defined
import { RecentComment } from "@/lib/types"; // Adjust path as per your project structure

export function RecentCommentsList() {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentComments() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/comments");
        setComments(response.data.comments);
      } catch (err) {
        console.error("Failed to fetch recent comments:", err);
        setError("Failed to load recent comments. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecentComments();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Recent Comments</CardTitle>
        <MessageSquare className="h-6 w-6 text-gray-500" />
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No recent comments found.
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center space-x-3 mb-1">
                  {/* Optional: User Profile Picture */}
                  {comment.createdBy.profilePictureUrl ? (
                    // Using `next/image` is recommended for optimization
                    // <img src={comment.createdBy.profilePictureUrl} alt={comment.createdBy.fullName} className="h-8 w-8 rounded-full" />
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                      {comment.createdBy.fullName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                      {comment.createdBy.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {comment.createdBy.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      commented on{" "}
                      {/* You might want to link to the specific task */}
                      <Link
                        href={`/tasks/${comment.task.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {comment.task.taskName}
                      </Link>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  {comment.content}
                </p>
                <p className="text-xs text-gray-400 text-right">
                  {formatDistanceToNowStrict(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
