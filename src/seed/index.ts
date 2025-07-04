import { PrismaClient } from "@/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting DB...");

  // Clear everything in order of dependency
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await hash("password", 10);
  const user1 = await prisma.user.create({
    data: {
      fullName: "User One",
      email: "user1@example.com",
      password: passwordHash,
      onboarded: true,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      fullName: "User Two",
      email: "user2@example.com",
      password: passwordHash,
      onboarded: true,
    },
  });
  const user3 = await prisma.user.create({
    data: {
      fullName: "User Three",
      email: "user3@example.com",
      password: passwordHash,
      onboarded: true,
    },
  });
  const user4 = await prisma.user.create({
    data: {
      fullName: "User Four",
      email: "user4@example.com",
      password: passwordHash,
      onboarded: true,
    },
  });

  // Workspaces
  const workspace1 = await prisma.workspace.create({
    data: {
      name: "Workspace Alpha",
    },
  });

  const workspace2 = await prisma.workspace.create({
    data: {
      name: "Workspace Beta",
    },
  });

  // Workspace Members
  await prisma.workspaceMember.createMany({
    data: [
      {
        userId: user1.id,
        workspaceId: workspace1.id,
        role: "OWNER",
        accessLevel: "OWNER",
      },
      {
        userId: user2.id,
        workspaceId: workspace1.id,
        role: "ADMIN",
        accessLevel: "MEMBER",
      },
      {
        userId: user3.id,
        workspaceId: workspace1.id,
        role: "MEMBER",
        accessLevel: "VIEWER",
      },
      {
        userId: user4.id,
        workspaceId: workspace2.id,
        role: "OWNER",
        accessLevel: "OWNER",
      },
      {
        userId: user1.id,
        workspaceId: workspace2.id,
        role: "MEMBER",
        accessLevel: "MEMBER",
      },
    ],
  });

  // Projects
  const project1 = await prisma.project.create({
    data: {
      name: "Project One",
      workspaceId: workspace1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Project Two",
      workspaceId: workspace2.id,
    },
  });

  // Tasks and Comments for each project
  for (const project of [project1, project2]) {
    for (let i = 1; i <= 2; i++) {
      const task = await prisma.task.create({
        data: {
          taskName: `Task ${i} of ${project.name}`,
          status: "TODO",
          priority: "MEDIUM",
          projectId: project.id,
        },
      });

      // Add comments to task
      await prisma.comment.createMany({
        data: [
          {
            content: `Comment A on ${task.taskName}`,
            taskId: task.id,
            createdById: user1.id,
          },
          {
            content: `Comment B on ${task.taskName}`,
            taskId: task.id,
            createdById: user2.id,
          },
        ],
      });
    }
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        content: "You have been added to Workspace Beta.",
      },
      {
        userId: user2.id,
        content: "A new task was assigned.",
      },
    ],
  });

  // Activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: user1.id,
        action: "Created Workspace Alpha",
        entityType: "Workspace",
        entityId: workspace1.id,
      },
      {
        userId: user4.id,
        action: "Created Workspace Beta",
        entityType: "Workspace",
        entityId: workspace2.id,
      },
    ],
  });

  console.log("🌱 Seed completed");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
