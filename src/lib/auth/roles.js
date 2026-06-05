function getRoleCandidates(user) {
  return [
    user?.publicMetadata?.role,
    user?.privateMetadata?.role,
    user?.metadata?.role,
    user?.sessionClaims?.publicMetadata?.role,
    user?.sessionClaims?.privateMetadata?.role,
    user?.sessionClaims?.metadata?.role,
    user?.role
  ].filter(Boolean);
}

function hasRole(user, role) {
  const candidates = getRoleCandidates(user);
  const roles = user?.roles || user?.sessionClaims?.roles || [];

  return (
    candidates.includes(role) ||
    (Array.isArray(roles) && roles.includes(role))
  );
}

// Clerk dashboard setup: trusted admin users must have
// publicMetadata.role or privateMetadata.role set to "admin".
export function isAdmin(user) {
  return hasRole(user, "admin");
}

// Clerk dashboard setup: claimed instructor users should have
// publicMetadata.role or privateMetadata.role set to "instructor".
export function isInstructor(user) {
  return hasRole(user, "instructor");
}

export const clerkRoleSetup =
  "Set publicMetadata.role or privateMetadata.role to admin for trusted Clerk admin users.";
