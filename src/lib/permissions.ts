export const PERMISSIONS = {
  // Task permissions
  VIEW_TASKS: "view_tasks",
  CREATE_TASKS: "create_tasks",
  EDIT_TASKS: "edit_tasks",
  DELETE_TASKS: "delete_tasks",
  COMMENT_TASKS: "comment_tasks",

  // Project permissions
  VIEW_PROJECTS: "view_projects",
  CREATE_PROJECTS: "create_projects",
  EDIT_PROJECTS: "edit_projects",
  DELETE_PROJECTS: "delete_projects",

  // Member permissions
  VIEW_MEMBERS: "view_members",
  INVITE_MEMBERS: "invite_members",
  REMOVE_MEMBERS: "remove_members",
  CHANGE_MEMBER_ROLES: "change_member_roles",

  // Workspace permissions
  EDIT_WORKSPACE: "edit_workspace",
  DELETE_WORKSPACE: "delete_workspace",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Step 1: Define base roles separately
const VIEWER_PERMISSIONS: Permission[] = [
  PERMISSIONS.VIEW_TASKS,
  PERMISSIONS.COMMENT_TASKS,
  PERMISSIONS.VIEW_PROJECTS,
  PERMISSIONS.VIEW_MEMBERS,
];

const MEMBER_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  PERMISSIONS.CREATE_TASKS,
  PERMISSIONS.EDIT_TASKS,
  PERMISSIONS.CREATE_PROJECTS,
  PERMISSIONS.EDIT_PROJECTS,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MEMBER_PERMISSIONS,
  PERMISSIONS.DELETE_TASKS,
  PERMISSIONS.DELETE_PROJECTS,
  PERMISSIONS.INVITE_MEMBERS,
  PERMISSIONS.REMOVE_MEMBERS,
  PERMISSIONS.CHANGE_MEMBER_ROLES,
  PERMISSIONS.EDIT_WORKSPACE,
  PERMISSIONS.DELETE_WORKSPACE,
];

// Step 2: Build final map
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  VIEWER: VIEWER_PERMISSIONS,
  MEMBER: MEMBER_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
};

export function hasPermission(
  userRole: string,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function canManageMembers(userRole: string): boolean {
  return hasPermission(userRole, PERMISSIONS.REMOVE_MEMBERS);
}

export function canInviteMembers(userRole: string): boolean {
  return hasPermission(userRole, PERMISSIONS.INVITE_MEMBERS);
}
