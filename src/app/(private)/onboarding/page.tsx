import OnboardingForm from "@/components/onboarding-form";
import { User } from "@/generated/prisma";
import { isAuthenticated } from "@/lib/server/auth";
import { getAuthUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const user = await getAuthUser();
  const loggedIn = await isAuthenticated();
  if (!loggedIn && !user) {
    redirect("/auth/login");
  }

  if (user?.onboarded) {
    redirect("/dashboard");
  }

  return <OnboardingForm user={user!} />;
}
