import { cookies } from "next/headers";
import JWT from "jsonwebtoken";
import { generateToken } from "@/lib/utils/jwt";
import { customMessage } from "@/lib/utils/customMessage";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return customMessage("Refresh token missing", {}, 401);
    }

    const decoded = JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateToken(decoded.id);

    return customMessage("Token refreshed", { token: newAccessToken }, 200);
  } catch (error) {
    return customMessage("Invalid refresh token", {}, 403);
  }
}
