import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";
import { withMiddleware } from "@/lib/utils/withMiddleware";
import { verifyToken } from "@/lib/middleware/verifyToken";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import ROLES from "@/lib/utils/roles";

// export const { GET, POST } = createRouteHandler({
//   router: ourFileRouter,
// });

const uploadHandler = createRouteHandler({ router: ourFileRouter });

export const POST = async (req) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin, ROLES.moderator))(
    req,
    () => uploadHandler.POST(req)
  );

export const GET = async (req) => uploadHandler.GET(req);
