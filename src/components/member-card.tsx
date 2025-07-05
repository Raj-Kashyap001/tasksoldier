import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  member: {
    fullName: string;
    email: string;
    role: string;
    profilePictureUrl?: string;
  };
}

export default function MemberCard({ member }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={member.profilePictureUrl} />
          <AvatarFallback>
            {member.fullName?.charAt(0).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-sm">{member.fullName}</CardTitle>
          <CardDescription>{member.email}</CardDescription>
          <span className="text-xs text-muted-foreground">{member.role}</span>
        </div>
      </CardHeader>
    </Card>
  );
}
