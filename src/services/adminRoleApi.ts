import { privateFetch } from "./client";
import { PRIVATE_API } from "./endpoints";

export interface AdminPermissions {
  categories: string[];
  states: string[];
  data_window: string;
}

export interface AdminUser {
  sub?: string;
  email: string;
  given_name?: string;
  family_name?: string;
  admin_role: "creator" | "reviewer" | "admin" | null;
  admin_permissions?: AdminPermissions | null;
}

export interface ListAdminUsersResponse {
  success: boolean;
  users: AdminUser[];
}

export interface AssignRoleResponse {
  success: boolean;
  message: string;
  user: AdminUser;
}

export interface RemoveRoleResponse {
  success: boolean;
  message: string;
}

/**
 * List all users with an admin role.
 */
export async function listAdminUsers(): Promise<ListAdminUsersResponse> {
  return privateFetch<ListAdminUsersResponse>(PRIVATE_API.ADMIN_ROLES.LIST, {
    method: "GET",
  });
}

/**
 * Assign a role and granular permissions to a user by email.
 */
export async function assignAdminRole(
  email: string,
  role: "creator" | "reviewer" | "admin",
  permissions: AdminPermissions
): Promise<AssignRoleResponse> {
  return privateFetch<AssignRoleResponse>(PRIVATE_API.ADMIN_ROLES.ASSIGN, {
    method: "POST",
    body: JSON.stringify({ email, role, permissions }),
  });
}

/**
 * Remove admin access / roles for a user.
 */
export async function removeAdminRole(sub: string): Promise<RemoveRoleResponse> {
  return privateFetch<RemoveRoleResponse>(PRIVATE_API.ADMIN_ROLES.REMOVE(sub), {
    method: "DELETE",
  });
}
