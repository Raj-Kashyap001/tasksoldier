"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface Props {
  member: {
    id: string;
    fullName: string;
    email: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    profilePictureUrl?: string;
    accessLevel: "OWNER" | "MEMBER" | "VIEWER";
  };
  currentUserId: string | null;
  onRemove: (id: string) => void;
  onChangeRole: (id: string, role: "ADMIN" | "MEMBER") => void;
}

export function MemberRow({
  member,
  currentUserId,
  onRemove,
  onChangeRole,
}: Props) {
  const isSelf = member.id === currentUserId;
  const isOwner = member.role === "OWNER";

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.profilePictureUrl || ""} />
            <AvatarFallback>
              {member.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{member.fullName}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {member.email}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{member.role}</Badge>
      </TableCell>
      <TableCell>
        <Badge>{member.accessLevel}</Badge>
      </TableCell>
      <TableCell className="text-right">
        {isSelf || isOwner ? (
          <Badge variant="secondary" className="text-xs">
            {isOwner ? "Owner" : "You"}
          </Badge>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onChangeRole(member.id, "ADMIN")}
              >
                Make Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onChangeRole(member.id, "MEMBER")}
              >
                Make Member
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRemove(member.id)}
                className="text-red-600"
              >
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}
