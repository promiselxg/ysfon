import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/dbConnect";

export const POST = async (req) => {
  try {
    // Accept incoming variables
    const { username, email_address, roles, password, confirm_password } =
      await req.json();

    // Validate required fields
    if (
      !username ||
      !roles ||
      roles.length === 0 ||
      !password ||
      !confirm_password
    ) {
      return NextResponse.json(
        { message: "Please fill out the required fields!" },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== confirm_password) {
      return NextResponse.json(
        { message: "Password Mismatch!" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const userExist = await prisma.user.findFirst({
      where: {
        OR: [{ email_address }, { username }],
      },
    });

    if (userExist) {
      return NextResponse.json(
        { message: "Username or Email address already exists." },
        { status: 400 }
      );
    }

    // Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user is an admin
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
      return NextResponse.json(
        {
          message: "Registration successful.",
          user: {
            id: user.id,
            username: user.username,
            email_address: user.email_address,
            isAdmin: user.isAdmin,
            roles: user.roles,
          },
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: "Registration failed. Please try again!" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong!", error: error.message },
      { status: 500 }
    );
  }
};
