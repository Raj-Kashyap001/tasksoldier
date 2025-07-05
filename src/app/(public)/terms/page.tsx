"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Tasksoldier is provided as-is, without warranty of any kind. By
            using or modifying this project, you accept full responsibility for
            its use.
          </p>
          <p>
            This project is licensed under the MIT License. You are free to use,
            modify, and distribute the software, provided that you include the
            original license and copyright.
          </p>
          <p>
            Contributions are welcome. Please follow the contribution guidelines
            on our{" "}
            <a
              href="https://github.com/Raj-Kashyap001/Tasksoldier"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              GitHub repository
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
