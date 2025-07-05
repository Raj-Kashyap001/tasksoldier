import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  member: {
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

export default function MemberCard({ member }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={member.profileImage} />
          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-sm">{member.name}</CardTitle>
          <CardDescription>{member.email}</CardDescription>
          <span className="text-xs text-muted-foreground">{member.role}</span>
        </div>
      </CardHeader>
    </Card>
  );
}
