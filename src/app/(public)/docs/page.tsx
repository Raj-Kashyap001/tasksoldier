"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Tasksoldier is an open source task and team management platform
            built with modern web technologies like Next.js, Prisma, and ShadCN
            UI.
          </p>
          <p>
            This documentation will grow over time. Contributions are welcome on
            our{" "}
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
          <p>
            For now, explore the source code to understand routing, API
            structure, and modular component design.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
