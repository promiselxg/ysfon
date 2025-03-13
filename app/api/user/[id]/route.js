import { suspendUserAccount, updateUserData } from "@/actions/user/userActions";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const GET = async (req, { params }) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin))(req, () =>
    suspendUserAccount(req, params)
  );

export const PUT = async (req, { params }) =>
  withMiddleware(verifyToken)(req, () => updateUserData(req, params));
