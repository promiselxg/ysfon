import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import { customMessage } from "@/lib/utils/customMessage";
import prisma from "@/lib/utils/dbConnect";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const GET = async (req) =>
  withMiddleware(verifyToken, verifyUserRoles(ROLES.admin))(req, getAllUsers);

const getAllUsers = async (req) => {
  const query = req.nextUrl.searchParams;
  const queryType = query.get("type") || "all";
  let response;

  try {
    switch (queryType) {
      case "all":
        response = await getRegisteredUsers();
        break;
      default:
        response = customMessage("Invalid query type", {}, 400);
    }

    return response;
  } catch (error) {
    return customMessage(
      "Something went wrong!",
      { error: error.message },
      500
    );
  }
};

const getRegisteredUsers = async () => {
  const users = await prisma.user.findMany({
    where: { accountStatus: false },
    select: {
      id: true,
      isAdmin: true,
      username: true,
      email_address: true,
      accountStatus: true,
      createdAt: true,
    },
  });
  return customMessage("All users", { count: users.length, users }, 200);
};
