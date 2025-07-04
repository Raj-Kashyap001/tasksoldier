"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
import "@uploadcare/react-uploader/core.css";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface EditUserDialogProps {
  user: {
    id: string;
    fullName: string;
    bio?: string | null;
    profilePictureUrl?: string | null;
  };
  open: boolean;
  onClose: () => void;
}

export function EditUserDialog({ user, open, onClose }: EditUserDialogProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user.profilePictureUrl || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate() {
    setLoading(true);
    setError(null);
    try {
      await api.put("/user/update", {
        fullName,
        bio,
        profilePictureUrl,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Avatar Upload */}
          <div className="flex justify-center items-center flex-col gap-2">
            <Avatar className="size-[84px]">
              <AvatarImage src={profilePictureUrl} />
              <AvatarFallback>{user.fullName[0]}</AvatarFallback>
            </Avatar>
            Change Your Profile Picture
            <FileUploaderRegular
              useCloudImageEditor={false}
              pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY as string}
              sourceList="local,camera"
              cameraModes="photo"
              multiple={false}
              onCommonUploadSuccess={(result) => {
                const url = result.successEntries?.[0]?.cdnUrl;
                if (url) {
                  setProfilePictureUrl(url);

                  // Optionally call backend immediately
                  api
                    .put("/user/update", {
                      fullName,
                      bio,
                      profilePictureUrl: url,
                    })
                    .catch(() => {
                      setError("Failed to update profile image");
                    });
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
