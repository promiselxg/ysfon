import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import { customMessage } from "@/lib/utils/customMessage";
import prisma from "@/lib/utils/dbConnect";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const GET = async (req, { params }) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin))(req, () =>
    suspendUserAccount(req, params)
  );

const suspendUserAccount = async (req, params) => {
  const { id } = await params; // Extract `id` from params

  if (!id) {
    return customMessage("User ID is required", {}, 400);
  }

  let response;
  try {
    response = await suspendAccount(id);
    return response;
  } catch (error) {
    return customMessage(
      "Something went wrong!",
      { error: error.message },
      500
    );
  }
};

const suspendAccount = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return customMessage("User not found", {}, 404);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: true }, // Assuming false means suspended
  });

  return customMessage("Account suspended successfully", {}, 200);
};
