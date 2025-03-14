import {
  deleteUserAccount,
  suspendUserAccount,
  updateUserData,
} from "@/controller/user/userController";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const GET = async (req, { params }) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin))(req, () =>
    suspendUserAccount(req, params)
  );

export const PUT = async (req, { params }) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin, ROLES.moderator))(
    req,
    () => updateUserData(req, params)
  );

export const DELETE = async (req, { params }) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin))(req, () =>
    deleteUserAccount(req, params)
  );
