import { blogControllers } from "@/controller/blog/blogControllers";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const POST = async (req) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin, ROLES.moderator))(
    req,
    () => blogControllers.createNewBlogCategory(req)
  );

export const GET = async (req) => blogControllers.getAllCategories(req);
