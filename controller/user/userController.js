import { customMessage, ServerError } from "@/lib/utils/customMessage";
import bcrypt from "bcryptjs";
import prisma from "@/lib/utils/dbConnect";
import { cookies } from "next/headers";
import ROLES from "@/lib/utils/roles";

const getAllUsers = async (req) => {
  const query = req.nextUrl.searchParams;
  const queryType = query.get("type") || "all";
  let response;

  try {
    switch (queryType) {
      case "all":
        response = await getRegisteredUsers();
        break;
      case "suspended":
        response = await getSuspendedUsers();
        break;
      default:
        response = customMessage("Invalid query type", {}, 400);
    }

    return response;
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getSingleUser = async (req, params) => {
  const { id } = await params;

  if (!id) {
    return customMessage("User ID is required", {}, 400);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        isAdmin: true,
        username: true,
        email_address: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      return customMessage("User not found", {}, 404);
    }

    return customMessage("User found", { user }, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateUserData = async (req, params) => {
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
      case "role":
        return await updateUserRoles({
          id,
          roles: body.new_role,
        });
      default:
        return customMessage("Invalid request type", {}, 400);
    }
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const suspendUserAccount = async (req, params) => {
  const { id } = await params;

  if (!id) {
    return customMessage("User ID is required", {}, 400);
  }

  let response;
  try {
    response = await suspendAccount(id);
    return response;
  } catch (error) {
    return ServerError(error, {}, 500);
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
    data: { accountStatus: true },
  });

  return customMessage("Account suspended successfully", {}, 200);
};

const deleteUserAccount = async (req, params) => {
  const { id } = await params;

  if (!id) {
    return customMessage("User ID is required", {}, 400);
  }

  let response;
  try {
    response = await deleteAccount(id);
    return response;
  } catch (error) {
    return ServerError(error, {}, 500);
  }
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
    return ServerError(error, {}, 500);
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
    return ServerError(error, {}, 500);
  }
};

const updateUserRoles = async ({ id, roles }) => {
  try {
    if (!id || !roles || roles.length === 0) {
      return customMessage("User ID and roles are required.", {}, 400);
    }

    // Convert ROLES object values to an array [2200, 1500]
    const validRoles = Object.values(ROLES);

    // Validate that all sent roles exist in the allowed ROLES
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return customMessage(
        `Invalid roles provided: ${invalidRoles.join(", ")}`,
        {},
        400
      );
    }
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!user) {
      return customMessage("User no found.", {}, 404);
    }

    // Delete existing roles before assigning new ones
    await prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // Assign new valid roles
    await prisma.userRole.createMany({
      data: roles.map((role) => ({
        userId: id,
        role,
      })),
    });

    await prisma.user.update({
      where: { id },
      data: { isAdmin: roles.includes(ROLES.admin) },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, email_address: true, roles: true },
    });

    return customMessage(
      "User roles updated successfully.",
      { user: updatedUser },
      200
    );
  } catch (error) {
    console.error("Error updating user roles:", error);
    return customMessage(
      "Something went wrong.",
      { error: error.message },
      500
    );
  }
};

const deleteAccount = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return customMessage("User not found", {}, 404);
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return customMessage("Account deleted successfully", {}, 200);
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

const getSuspendedUsers = async () => {
  const users = await prisma.user.findMany({
    where: { accountStatus: true },
    select: {
      id: true,
      isAdmin: true,
      username: true,
      email_address: true,
      accountStatus: true,
      createdAt: true,
    },
  });
  return customMessage("Suspended users", { count: users.length, users }, 200);
};

export const userControllers = {
  getAllUsers,
  getSingleUser,
  updateUserData,
  suspendUserAccount,
  deleteUserAccount,
};
