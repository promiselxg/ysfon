import { userControllers } from "@/controller/user/userController";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";

import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const GET = async (req) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin))(
    req,
    userControllers.getAllUsers
  );
