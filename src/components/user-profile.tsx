// components/user-profile-page.tsx
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditUserDialog } from "@/components/user-profile/edit-user-dialog";
import { toast } from "sonner";
import { api } from "@/lib/axios";

type User = {
  id: string;
  fullName: string;
  email: string;
  bio?: string | null;
  profilePictureUrl?: string | null;
};

interface Props {
  user: User;
}

export default function UserProfilePage({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State for loading indicator

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    toast.info("Attempting to delete your account...");

    try {
      const response = await api.delete("/user/delete");

      if (response.status === 200) {
        toast.success("Account deleted successfully. Redirecting...");

        window.location.href = "/";
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } catch (error: any) {
      console.error("Account deletion failed:", error);
      let errorMessage = "An unexpected error occurred during deletion.";

      if (error && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      {/* --- User Profile Card --- */}
      <Card>
        <CardHeader className="items-center text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage
              src={user.profilePictureUrl || ""}
              alt={user.fullName}
            />
            <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
          </Avatar>
          <CardTitle>{user.fullName}</CardTitle>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm">
            <span className="font-medium">Bio:</span>{" "}
            {user.bio || (
              <span className="text-muted-foreground italic">No bio yet.</span>
            )}
          </p>
          <Button onClick={() => setOpen(true)} variant="default">
            Edit Profile
          </Button>
        </CardContent>
      </Card>
      {/* --- Delete Account Section --- */}

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Permanently remove your account and all of its contents. This action
            is not reversible.
          </p>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete My Account"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      <EditUserDialog open={open} onClose={() => setOpen(false)} user={user} />
    </div>
  );
}
