import { Prisma } from "@prisma/client";

const { NextResponse } = require("next/server");

export const customMessage = (message, data = {}, status = 200) => {
  return new NextResponse(JSON.stringify({ message, ...data }), { status });
};

export const ServerError = (error, data = {}, status = 400) => {
  let message = "Something Went Wrong";

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        message = "Unique constraint failed. This record already exists.";
        break;
      case "P2025":
        message =
          "This operation failed because it depends on one or more records that were required but not found.";
        break;
      case "P2003":
        message = "Foreign key constraint failed.";
        break;
      case "P2000":
        message = "Value is too long for the column.";
        break;
      default:
        message = "A database error occurred.";
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    message = "Validation error: Invalid data provided.";
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    message = "Database connection error.";
  }

  return new NextResponse(JSON.stringify({ message, ...data }), { status });
};
