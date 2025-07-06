"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCreateModal } from "@/components/project-create-modal";
import Link from "next/link";

// TODO: SHOW LOADER WHEN A PROJECT IS LOADING

// Using a professional, management-related icon
import { BriefcaseBusiness } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/projects")
      .then((res) => setProjects(res.data.projects))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex  justify-between items-center">
        <PageHeader
          title="My Projects"
          description="Manage all your active and archived projects."
        />
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden md:block md:pl-2">Create New Project</span>
        </Button>
      </div>

      {/* --- */}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />{" "}
          {/* Blue spinner */}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 hover:border-blue-500">
                  {" "}
                  {/* Blue hover border */}
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-semibold">
                      {project.name}
                    </CardTitle>
                    <div className="p-2 bg-blue-100 rounded-full">
                      {" "}
                      {/* Light blue background for icon */}
                      <BriefcaseBusiness className="h-6 w-6 text-blue-600" />{" "}
                      {/* Blue briefcase icon */}
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {project.description ||
                      "No description provided for this project."}{" "}
                    {/* Standard description */}
                    <div className="mt-3 text-xs text-gray-500">
                      {" "}
                      {/* Use gray for dates */}
                      Created On:{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <BriefcaseBusiness className="h-12 w-12 text-gray-400 mb-4" />{" "}
          {/* Gray briefcase for empty state */}
          <p className="text-lg text-muted-foreground">
            No projects found. Start by creating a new one!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Click "Create New Project" to begin.
          </p>
        </div>
      )}

      {/* --- */}

      <ProjectCreateModal
        open={open}
        onOpenChange={setOpen}
        onProjectCreated={(p) => setProjects([p, ...projects])}
      />
    </div>
  );
}
