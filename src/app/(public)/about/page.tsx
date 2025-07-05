"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>About </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong>Tasksoldier</strong> is a modern, open source task and
            project management platform designed for individuals, teams, and
            organizations that value speed, clarity, and self-hosting.
          </p>

          <p>
            Built with cutting-edge technologies like <strong>Next.js</strong>,{" "}
            <strong>Prisma</strong>, and <strong>ShadCN UI</strong>, Tasksoldier
            aims to provide a clean developer experience, modular architecture,
            and high extensibility.
          </p>

          <p>
            Whether you're managing a solo project or coordinating a growing
            team, Tasksoldier gives you the tools to stay focused and organized
            — all while remaining in control of your data.
          </p>

          <p>
            This project is MIT-licensed and open to contributions. You can find
            the source code on GitHub:
          </p>

          <a
            href="https://github.com/Raj-Kashyap001/tasksoldier"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm underline"
          >
            <svg
              className="w-8 h-8"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>GitHub</title>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Raj-Kashyap001/Tasksoldier
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
