import {
  createNewProduct,
  getAllProducts,
} from "@/controller/product/productController";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const POST = async (req) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin, ROLES.moderator))(
    req,
    () => createNewProduct(req)
  );

export const GET = async (req) => getAllProducts(req);
