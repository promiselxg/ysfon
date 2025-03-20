import { NextResponse } from "next/server";
import JWT from "jsonwebtoken";
import { cookies } from "next/headers";
import { generateToken } from "@/lib/utils/jwt";

export const GET = async () => {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return new NextResponse(
        JSON.stringify({ message: "Refresh token missing" }),
        { status: 401 }
      );
    }

    const decoded = JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateToken(decoded.id);

    cookieStore.set("token", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60,
      secure: process.env.NODE_ENV === "production",
    });

    return new NextResponse(
      JSON.stringify({ message: "Token refreshed", token: newAccessToken }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid refresh token" }),
      { status: 403 }
    );
  }
};
