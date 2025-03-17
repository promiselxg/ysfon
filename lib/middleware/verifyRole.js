import { customMessage } from "../utils/customMessage";

export function verifyUserRoles(...allowedRoles) {
  return (req) => {
    if (!req.user) {
      return customMessage("Unauthorized: No user data", {}, 403);
    }

    const hasAccess = req.user.roles.some((role) =>
      allowedRoles.includes(role.role)
    );

    if (!hasAccess) {
      return customMessage("Forbidden: Insufficient permissions", {}, 403);
    }

    return;
  };
}
