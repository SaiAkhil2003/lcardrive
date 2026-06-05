export function hasAdminRole(sessionClaims) {
  const metadataRole = sessionClaims?.metadata?.role;
  const publicMetadataRole = sessionClaims?.publicMetadata?.role;
  const customRole = sessionClaims?.role;
  const customRoles = sessionClaims?.roles;

  return (
    metadataRole === "admin" ||
    publicMetadataRole === "admin" ||
    customRole === "admin" ||
    (Array.isArray(customRoles) && customRoles.includes("admin"))
  );
}

export const clerkAdminRoleSetup =
  "Set a Clerk session custom claim that exposes role=admin or metadata.role=admin for trusted admin users.";
