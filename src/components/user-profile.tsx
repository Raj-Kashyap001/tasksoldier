"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditUserDialog } from "./edit-user-dialog";

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

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
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
        <CardContent className="text-center space-y-2">
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

      <EditUserDialog open={open} onClose={() => setOpen(false)} user={user} />
    </div>
  );
}
