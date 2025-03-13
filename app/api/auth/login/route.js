import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken, generateRefreshToken } from "@/utils/jwt";
import { cookies } from "next/headers";
import prisma from "@/utils/dbConnect";

export const POST = async (req) => {
  const { username, password } = await req.json();

  // Check user credentials
  if (!username || !password) {
    return new NextResponse(
      JSON.stringify({ message: "Please enter your username or password." }),
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { username },
    include: { roles: true },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    const roles = user.roles.map((role) => role.role);
    const token = generateToken(user.id, roles, user.isAdmin, username);
    const refreshToken = generateRefreshToken(user.id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const cookieStore = await cookies();
    cookieStore.set("token", token, { ...options, maxAge: 15 * 60 });
    cookieStore.set("refreshToken", refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60,
    });

    return new NextResponse(
      JSON.stringify({
        message: "Login Successful",
        userInfo: {
          token,
          refreshToken,
          id: user.id,
          isAdmin: user.isAdmin,
          username,
        },
      }),
      { status: 200 }
    );
  } else {
    return new NextResponse(
      JSON.stringify({ message: "Incorrect username or password." }),
      { status: 400 }
    );
  }
};
