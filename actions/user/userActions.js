"use server";

import { customMessage } from "@/lib/utils/customMessage";
import bcrypt from "bcryptjs";
import prisma from "@/lib/utils/dbConnect";
import { cookies } from "next/headers";

export const updateUserData = async (req, params) => {
  const { id } = await params;

  if (!id) {
    return customMessage("User ID is required", {}, 400);
  }

  try {
    const body = await req.json();
    switch (body.type) {
      case "username":
        return await updateUsername({
          id,
          username: body.username,
          password: body.password,
          newUsername: body.new_username,
        });
      case "password":
        return await updatePassword({
          id,
          username: body.username,
          currentPassword: body.current_password,
          newPassword: body.new_password,
          confirmPassword: body.confirm_password,
        });
      default:
        return customMessage("Invalid request type", {}, 400);
    }
  } catch (error) {
    return customMessage(
      "Something went wrong!",
      { error: error.message },
      500
    );
  }
};

export const suspendUserAccount = async (req, params) => {
  const { id } = await params;

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

export const suspendAccount = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return customMessage("User not found", {}, 404);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: true },
  });

  return customMessage("Account suspended successfully", {}, 200);
};

const updateUsername = async ({ id, username, password, newUsername }) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return customMessage("User not found", {}, 404);
    }

    if (user.username !== username) {
      return customMessage("Incorrect username", {}, 400);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return customMessage("Incorrect password", {}, 400);
    }

    const usernameExists = await prisma.user.findFirst({
      where: { username: newUsername },
    });

    if (usernameExists) {
      return customMessage("Username already exists", {}, 400);
    }

    await prisma.user.update({
      where: { id },
      data: { username: newUsername },
    });

    const cookieStore = await cookies();
    cookieStore.delete("token");
    cookieStore.delete("refreshToken");

    return customMessage(
      "Username updated successfully. Please log in again.",
      {},
      200
    );
  } catch (error) {
    return customMessage(
      "Something went wrong!",
      { error: error.message },
      500
    );
  }
};

const updatePassword = async ({
  id,
  username,
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return customMessage("User not found", {}, 404);
    }

    if (user.username !== username) {
      return customMessage("Incorrect username", {}, 400);
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return customMessage("Incorrect password", {}, 400);
    }

    if (newPassword !== confirmPassword) {
      return customMessage("Passwords do not match", {}, 400);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    const cookieStore = await cookies();
    cookieStore.delete("token");
    cookieStore.delete("refreshToken");

    return customMessage(
      "Password updated successfully. Please log in again.",
      {},
      200
    );
  } catch (error) {
    return customMessage(
      "Something went wrong!",
      { error: error.message },
      500
    );
  }
};
