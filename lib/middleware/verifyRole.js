import { customMessage } from "../utils/customMessage";

export function verifyUserRoles(...allowedRoles) {
  return async (req) => {
    const user = JSON.parse(req.headers.get("user") || "{}");
    if (!user?.roles?.length) {
      return customMessage("Unauthorized Access", {}, 401);
    }
    const hasAccess = user.roles.some((role) =>
      allowedRoles.includes(role.role)
    );

    if (!hasAccess) {
      return customMessage("Access Denied", {}, 403);
    }
    return;
  };
}
