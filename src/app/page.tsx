import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import AppNavbar from "@/components/app-navbar";
import AppFooter from "@/components/app-footer";
import { isAuthenticated } from "@/lib/server/auth";

export default async function HomePage() {
  const loggedIn = await isAuthenticated();
  return (
    <>
      <AppNavbar />
      <main className="min-h-screen bg-gradient-to-br from-background/90 to-muted flex flex-col items-center px-4 py-12">
        {/* Logo */}
        <Image
          src="/logo.svg"
          alt="TaskSoldier Logo"
          width={64}
          height={64}
          className="mb-6"
        />
        {/* Hero Section */}
        <section className="text-center max-w-2xl mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-4">
            Task management made simple.
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Organize tasks, manage teams, and hit your goals without the chaos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <Button className="px-6 py-4 text-base">
                {loggedIn ? "Go to Dashboad" : "Get Started"}
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="px-6 py-4 text-base">
                Learn More
              </Button>
            </Link>
          </div>
        </section>
        {/* Feature Grid */}
        <section className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Collaborate Easily</CardTitle>
              <CardDescription>
                Invite team members, assign roles, and track progress in
                real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Workspaces, invites, and real-time updates built-in.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Stay Organized</CardTitle>
              <CardDescription>
                Break projects into tasks and never lose sight of what matters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use deadlines, priorities, and statuses to stay on track.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Built for Scale</CardTitle>
              <CardDescription>
                Manage multiple workspaces, users, and permissions without
                complexity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Role-based access and workspace switching made easy.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <AppFooter />
    </>
  );
}
