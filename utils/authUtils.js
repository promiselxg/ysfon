"use server";

import JWT from "jsonwebtoken";
import { cookies } from "next/headers";

//  Get token from Model and create cookie
export const generateCookieResponse = async (
  userId,
  userRole,
  isAdmin,
  username
) => {
  const token = generateToken(userId, userRole, isAdmin, username);
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  cookies().set("token", token, options);
  return token;
};

//  Generate JWT
const generateToken = (id, role, isAdmin, username) => {
  return JWT.sign({ id, role, isAdmin, username }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};
