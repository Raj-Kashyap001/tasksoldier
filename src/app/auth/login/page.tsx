import { LoginForm } from "@/components/auth/login-form";
import { isAuthenticated } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const loggedIn = await isAuthenticated();
  if (loggedIn) redirect("/dashboard");
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
