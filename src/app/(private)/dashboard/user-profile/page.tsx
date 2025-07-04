import UserProfile from "@/components/user-profile";
import { getAuthUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function UserProfilePage() {
  const user = await getAuthUser();
  if (!user) redirect("/");

  return <UserProfile user={user} />;
}
