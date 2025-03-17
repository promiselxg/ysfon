import { projectControllers } from "@/controller/project/projectControllers";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const POST = async (req) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin, ROLES.moderator))(
    req,
    () => projectControllers.createProjectCategory(req)
  );

export const GET = async (req) =>
  projectControllers.getAllProjectCategories(req);
