import { customMessage, ServerError } from "@/lib/utils/customMessage";
import prisma from "@/lib/utils/dbConnect";

const createNewCategory = async (req) => {
  try {
    const { name } = await req.json();
    if (!name) {
      return customMessage("Category name is required", {}, 400);
    }
    const nameExist = await prisma.category.findFirst({
      where: { name },
    });

    if (nameExist) {
      return customMessage("Category already exists", {}, 409);
    }

    const category = await prisma.category.create({
      data: { name },
    });

    return customMessage("Category created successfully", { category }, 201);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateCategory = async (req, params) => {
  const { id } = await params;
  if (!id) {
    return customMessage("Category ID is required", {}, 400);
  }
  try {
    const { name } = await req.json();
    if (!name) {
      return customMessage("Category name is required", {}, 400);
    }
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    return customMessage("Category updated successfully", { category }, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
    });
    return customMessage(
      "Categories retrieved successfully",
      { count: categories.length, categories },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteCategory = async (req, params) => {
  const { id } = await params;
  if (!id) {
    return customMessage("Category ID is required", {}, 400);
  }

  try {
    const categoryExist = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!categoryExist) {
      return customMessage("Category not found or does not exist.", {}, 404);
    }

    // Delete all products under the category
    await prisma.product.deleteMany({
      where: { categoryId: id },
    });

    // delete the category
    await prisma.category.delete({
      where: { id },
    });

    return customMessage("Category deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

export const categoryControllers = {
  createNewCategory,
  updateCategory,
  getAllCategories,
  deleteCategory,
};
