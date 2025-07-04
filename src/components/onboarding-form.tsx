"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/axios";
import { onboardingSchema, type OnboardingData } from "@/lib/definitions";

interface OnboardingClientProps {
  user: {
    fullName: string;
    email: string;
  };
}

export default function OnboardingForm({ user }: OnboardingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      workspaceName: "",
    },
  });

  const onSubmit = async (values: OnboardingData) => {
    try {
      setLoading(true);
      await api.post("/user/onboarding", {
        workspaceName: values.workspaceName,
      });
      router.replace("/dashboard");
    } catch (err: any) {
      form.setError("workspaceName", {
        message: err?.response?.data?.message || "Failed to create workspace.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center gap-2">
            <Avatar className="h-14 w-14">
              <AvatarFallback>
                {form.watch("workspaceName").charAt(0).toUpperCase() || "W"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">Create your first workspace</h2>
            <p className="text-muted-foreground text-sm">
              This will be your team space, {user.fullName}.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading) form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="workspaceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Design Squad" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Workspace"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
