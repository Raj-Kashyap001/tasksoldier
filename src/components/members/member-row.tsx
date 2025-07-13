// Updated MemberRow component
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, LogOut } from "lucide-react";
import { canManageMembers } from "@/lib/permissions";

interface Props {
  member: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    role: "VIEWER" | "MEMBER" | "ADMIN";
    profilePictureUrl?: string;
    joinedAt: string;
  };
  currentUserId: string | null;
  currentUserRole: "VIEWER" | "MEMBER" | "ADMIN";
  onRemove: (id: string) => void;
  onChangeRole: (id: string, role: "VIEWER" | "MEMBER" | "ADMIN") => void;
  onLeaveWorkspace: () => void;
}

export function MemberRow({
  member,
  currentUserId,
  currentUserRole,
  onRemove,
  onChangeRole,
  onLeaveWorkspace,
}: Props) {
  const isSelf = member.userId === currentUserId;
  const canManage = canManageMembers(currentUserRole);

  // Don't allow changing admin role if current user is not admin
  // Don't allow changing your own role
  const canChangeRole = canManage && !isSelf;
  const canRemoveMember = canManage && !isSelf;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "MEMBER":
        return "secondary";
      case "VIEWER":
        return "outline";
      default:
        return "outline";
    }
  };

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
          <div>
            <span className="font-medium">{member.fullName}</span>
            {isSelf && (
              <span className="text-xs text-muted-foreground ml-2">(You)</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {member.email}
      </TableCell>
      <TableCell>
        <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(member.joinedAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isSelf ? (
              <DropdownMenuItem
                onClick={onLeaveWorkspace}
                className="text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Workspace
              </DropdownMenuItem>
            ) : (
              <>
                {canChangeRole && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onChangeRole(member.id, "ADMIN")}
                      disabled={member.role === "ADMIN"}
                    >
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onChangeRole(member.id, "MEMBER")}
                      disabled={member.role === "MEMBER"}
                    >
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onChangeRole(member.id, "VIEWER")}
                      disabled={member.role === "VIEWER"}
                    >
                      Make Viewer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {canRemoveMember && (
                  <DropdownMenuItem
                    onClick={() => onRemove(member.id)}
                    className="text-red-600"
                  >
                    Remove Member
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
