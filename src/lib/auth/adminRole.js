import { clerkRoleSetup, isAdmin } from "./roles";

export function hasAdminRole(sessionClaims) {
  return isAdmin({ sessionClaims, ...sessionClaims });
}

export const clerkAdminRoleSetup = clerkRoleSetup;
