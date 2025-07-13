export function getAvailableRoles(currentUserRole: string) {
  const roles = [
    {
      value: "VIEWER",
      label: "Viewer",
      description: "Can view and comment on tasks",
    },
    {
      value: "MEMBER",
      label: "Member",
      description: "Can create tasks and projects",
    },
    {
      value: "ADMIN",
      label: "Admin",
      description: "Can manage members and workspace",
    },
  ];

  if (currentUserRole !== "ADMIN") {
    return roles.filter((r) => r.value !== "ADMIN");
  }

  return roles;
}

export function checkInvitePermission(
  inviterRole: string,
  inviteeRole: string
): boolean {
  if (inviterRole !== "ADMIN") {
    return false;
  }

  return ["VIEWER", "MEMBER", "ADMIN"].includes(inviteeRole);
}
