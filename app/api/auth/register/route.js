import bcrypt from "bcryptjs";
import prisma from "@/lib/utils/dbConnect";
import { customMessage } from "@/lib/utils/customMessage";

export const POST = async (req) => {
  try {
    // Accept incoming variables
    const { username, email_address, roles, password, confirm_password } =
      await req.json();

    if (
      !username ||
      !roles ||
      roles.length === 0 ||
      !password ||
      !confirm_password
    ) {
      return customMessage("Please fill out the required fields!", {}, 400);
    }

    if (password !== confirm_password) {
      return customMessage("Password Mismatch!", {}, 400);
    }

    // Check if user already exists
    const userExist = await prisma.user.findFirst({
      where: {
        OR: [{ email_address }, { username }],
      },
    });

    if (userExist) {
      return customMessage(
        "Username or Email address already exists.",
        {},
        400
      );
    }

    // Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isAdmin = roles.includes(2200);

    // Create the user with roles
    const user = await prisma.user.create({
      data: {
        username,
        email_address,
        password: hashedPassword,
        isAdmin,
        roles: {
          create: roles.map((role) => ({
            role,
          })),
        },
      },
    });

    if (user) {
      return customMessage(
        "Registration successful.",
        {
          user: {
            id: user.id,
            username: user.username,
            email_address: user.email_address,
            isAdmin: user.isAdmin,
            roles: user.roles,
          },
        },
        201
      );
    } else {
      return customMessage("Registration failed. Please try again", {}, 400);
    }
  } catch (error) {
    return customMessage(
      "Something went wrong!",
      { error: error.message },
      500
    );
  }
};
