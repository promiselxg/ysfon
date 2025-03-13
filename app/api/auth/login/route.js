import bcrypt from "bcryptjs";
import { generateToken, generateRefreshToken } from "@/lib/utils/jwt";
import { cookies } from "next/headers";
import prisma from "@/lib/utils/dbConnect";
import { customMessage } from "@/lib/utils/customMessage";

export const POST = async (req) => {
  const { username, password } = await req.json();

  // Check user credentials
  if (!username || !password) {
    return customMessage("Please enter your username or password.", {}, 400);
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

    return customMessage(
      "Login Successful",
      {
        userInfo: {
          token,
          refreshToken,
          id: user.id,
          isAdmin: user.isAdmin,
          username,
        },
      },
      200
    );
  } else {
    return customMessage("Incorrect username or password.", {}, 400);
  }
};
