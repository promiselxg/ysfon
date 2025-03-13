import jwt from "jsonwebtoken";
import prisma from "../utils/dbConnect";
import { customMessage } from "../utils/customMessage";

export async function verifyToken(req) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return customMessage("Unauthorized: Token required.", {}, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, roles: true },
    });

    if (!user) {
      return customMessage("User not found", {}, 404);
    }
    // ✅ Attach user to the request headers for next middleware
    req.headers.set("user", JSON.stringify(user));
    // ✅ Return nothing to allow the next middleware to execute
    return;
  } catch (error) {
    return customMessage("Invalid Token", {}, 403);
  }
}
