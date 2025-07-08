import OnboardingForm from "@/components/auth/onboarding-form";
import { isAuthenticated } from "@/lib/server/auth";
import { getAuthUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const loggedIn = await isAuthenticated();
  const user = await getAuthUser();
  if (!loggedIn && !user) {
    redirect("/auth/login");
  }

  if (user?.onboarded) {
    redirect("/dashboard");
  }

  return <OnboardingForm user={user!} />;
}
