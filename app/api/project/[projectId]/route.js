import { projectControllers } from "@/controller/project/projectControllers";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const DELETE = async (req, { params }) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin, ROLES.moderator))(
    req,
    () => projectControllers.deleteProject(req, params)
  );

export const PATCH = async (req, { params }) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin, ROLES.moderator))(
    req,
    () => projectControllers.updateSingleProject(req, params)
  );
export const GET = async (req, { params }) =>
  projectControllers.getSingleProject(req, params);
