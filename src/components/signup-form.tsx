"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { api } from "@/lib/axios";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    const res = await api.post("/signup", {
      fullName,
      email,
      password,
    });
    if (res.status !== 201) {
      setErrorMessage("Failed to create user please try again!");
      setLoading(false);
    } else {
      setLoading(false);
      console.log("Sign Up Success!");
      redirect("/onboarding");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Brand Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <img
          src="/logo.svg"
          alt="TaskSoldier Logo"
          className="h-8 w-8 dark:brightness-200"
        />
        <Link
          href={"/"}
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          TaskSoldier
        </Link>
      </div>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-balance">
                  Start managing your team with TaskSoldier
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                  required
                  value={fullName}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  type="email"
                  value={email}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  min={8}
                  value={password}
                  required
                />
              </div>
              {errorMessage && (
                <p className="text-red-400 text-center"> {errorMessage} </p>
              )}
              <Button type="submit" className="w-full">
                {loading ? (
                  <span className="flex gap-2">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Please
                    Wait...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/signup-cover-image.webp"
              alt="Signup image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
