"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";
import { signupSchema } from "@/lib/definitions";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { HttpStatus } from "@/lib/enums";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    // Zod validation
    const parsed = signupSchema.safeParse(formData);
    if (!parsed.success) {
      const validationError = z.prettifyError(parsed.error);
      console.log(validationError);
      setErrorMessage(validationError || "Invalid input try again!");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/signup", formData);

      if (res.status === HttpStatus.CREATED) {
        router.push("/onboarding");
      } else {
        setErrorMessage("Unexpected response from server");
      }
    } catch (err: any) {
      if (err?.response?.status === HttpStatus.CONFLICT) {
        setErrorMessage("User with this email already exists.");
      } else {
        const message =
          err?.response?.data?.message || "Something went wrong. Try again.";
        setErrorMessage(message);
      }
      setLoading(false);
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

      {/* Form Card */}
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-balance">
                  Start managing your team with TaskSoldier
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              {errorMessage && (
                <p className="text-red-500 text-center text-sm">
                  {errorMessage}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Please wait...
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

      {/* Legal */}
      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
