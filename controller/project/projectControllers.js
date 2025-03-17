import { customMessage, ServerError } from "@/lib/utils/customMessage";
import { isValidUUID } from "@/lib/utils/validateUUID";
import sanitize from "sanitize-html";

const createProjectCategory = async (req) => {
  try {
    const { title } = await req.json();

    if (!title) {
      return customMessage("Fill out the required fields.", {}, 400);
    }

    if (
      await prisma.projectCategory.findFirst({
        where: {
          title: sanitize(title),
        },
      })
    ) {
      return customMessage("Project category title already exist.", {}, 409);
    }

    const newCategory = await prisma.projectCategory.create({
      data: {
        title: sanitize(title),
      },
    });

    return customMessage(
      "Project category created successfully.",
      { newCategory },
      201
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getAllProjectCategories = async (req) => {
  try {
    const allCategories = await prisma.projectCategory.findMany({
      orderBy: {
        title: "asc",
      },
      select: { id: true, title: true },
    });
    return customMessage(
      "Categories retrieved successfully",
      { allCategories },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateProjectCategory = async (req, params) => {
  const { categoryId } = await params;

  if (!categoryId) {
    return customMessage("project category ID is required", {}, 400);
  }
  try {
    const { title } = await req.json();
    if (!title) {
      return customMessage("project category title is required", {}, 400);
    }

    if (typeof title !== "string") {
      return customMessage("project category title must be a string", {}, 400);
    }

    if (
      await prisma.projectCategory.findFirst({
        where: {
          title: sanitize(title),
        },
      })
    ) {
      return customMessage("title already exist", {}, 409);
    }

    const category = await prisma.projectCategory.update({
      where: { id: categoryId },
      data: { title: sanitize(title) },
    });

    return customMessage(
      "Project category updated successfully",
      { category },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteProjectCategory = async (req, params) => {
  const { categoryId } = await params;

  if (!categoryId) {
    return customMessage("Category ID is required", {}, 400);
  }

  if (!isValidUUID(categoryId)) {
    return customMessage("Invalid Category ID", {}, 400);
  }

  try {
    const categoryExist = await prisma.projectCategory.findUnique({
      where: { id: categoryId },
      include: { projects: true },
    });

    if (!categoryExist) {
      return customMessage("Category not found or does not exist.", {}, 404);
    }

    await prisma.project.deleteMany({
      where: { categoryId },
    });

    await prisma.projectCategory.delete({
      where: { id: categoryId },
    });

    return customMessage("project category deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

export const projectControllers = {
  createProjectCategory,
  getAllProjectCategories,
  updateProjectCategory,
  deleteProjectCategory,
};
