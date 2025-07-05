"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Tasksoldier is an open source project. We do not collect or process
            any personal data unless explicitly configured by you on a
            self-hosted instance.
          </p>
          <p>
            If you are using a hosted version, please check with the hosting
            provider to understand what data is collected and how it's used.
          </p>
          <p>
            We recommend self-hosting for maximum privacy. No telemetry,
            analytics, or third-party tracking is built into the project by
            default.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
