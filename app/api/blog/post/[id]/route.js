import { blogControllers } from "@/controller/blog/blogControllers";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const GET = async (req, { params }) =>
  blogControllers.getSigleBlogPost(req, params);

export const PATCH = async (req, { params }) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin, ROLES.moderator))(
    req,
    () => blogControllers.updateBlogPost(req, params)
  );

export const DELETE = async (req, { params }) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin))(req, () =>
    blogControllers.deleteBlogPost(req, params)
  );
