import { customMessage, ServerError } from "@/lib/utils/customMessage";
import prisma from "@/lib/utils/dbConnect";
import { isValidUUID } from "@/lib/utils/validateUUID";
import sanitizeHtml from "sanitize-html";

const createNewProduct = async (req) => {
  try {
    const { name, description, price, categoryid, stock, images } =
      await req.json();

    if (
      !name ||
      !description ||
      !price ||
      !categoryid.trim() ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return customMessage("All fields are required", {}, 400);
    }

    const cleanName = sanitizeHtml(name);
    const cleanDescription = sanitizeHtml(description);

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return customMessage("Invalid price value", {}, 400);
    }

    if (
      !(await prisma.category.findUnique({
        where: { id: categoryid },
      }))
    ) {
      return customMessage("Category does not exist", {}, 400);
    }

    if (stock && typeof stock !== "number") {
      return customMessage("Stock must be a number", {}, 400);
    }

    if (await prisma.product.findFirst({ where: { name: cleanName } })) {
      return customMessage("Product with this name already exists", {}, 409);
    }

    const formattedImages = images.map((img) => {
      if (!img.publicId || !img.public_url) {
        throw new Error("Each image must have a public_id and public_url.");
      }
      return { publicId: img.publicId, public_url: img.public_url };
    });

    const product = await prisma.product.create({
      data: {
        name: cleanName,
        description: cleanDescription,
        price: numericPrice,
        category: { connect: { id: categoryid } },
        stock: stock || 0,
        images: formattedImages,
      },
    });

    return customMessage("Product created successfully", { product }, 201);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getAllProducts = async (req) => {
  const query = req.nextUrl.searchParams;

  const page = parseInt(query.get("page")) || 1;
  const limit = parseInt(query.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const search = query.get("search")?.trim().toLowerCase();
  const minPrice = query.get("minPrice")
    ? parseFloat(query.get("minPrice"))
    : null;
  const maxPrice = query.get("maxPrice")
    ? parseFloat(query.get("maxPrice"))
    : null;
  let categoryId = query.get("categoryId")?.trim();
  categoryId = isValidUUID(categoryId) ? categoryId : null;

  try {
    //  dynamic filters
    const filters = {};

    if (search) {
      filters.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minPrice !== null || maxPrice !== null) {
      filters.price = {};
      if (minPrice !== null) filters.price.gte = minPrice;
      if (maxPrice !== null) filters.price.lte = maxPrice;
    }

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    //  Fetch filtered products
    const products = await prisma.product.findMany({
      where: filters,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        createdAt: true,
        images: true,
        category: { select: { id: true, name: true } },
      },
    });

    const totalCount = await prisma.product.count({ where: filters });

    return customMessage(
      "Products retrieved successfully",
      { count: products.length, totalCount, products },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getSingleProduct = async (req, params) => {
  const { id } = await params;
  if (!id) {
    return customMessage("Product ID is required", {}, 400);
  }

  if (!isValidUUID(id)) {
    return customMessage("Invalid product ID", {}, 400);
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        description: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: true,
        createdAt: true,
      },
    });

    if (!product) {
      return customMessage("Product not found", {}, 404);
    }

    if (product && Array.isArray(product.images)) {
      product.images = product.images.map((img) => ({
        public_url: img.public_url,
      }));
    }

    return customMessage("Product found", { product }, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateProduct = async (req, params) => {
  try {
    const { id } = await params;
    const updates = await req.json();

    if (!id) {
      return customMessage("Product ID is required", {}, 400);
    }

    if (!isValidUUID(id)) {
      return customMessage("Invalid product ID", {}, 400);
    }

    if (
      !(await prisma.product.findUnique({
        where: { id },
      }))
    ) {
      return customMessage("Product not found", {}, 404);
    }

    // Ensure updates contain at least one valid field
    if (Object.keys(updates).length === 0 || updates === null) {
      return customMessage("No update fields provided", {}, 400);
    }

    // Validate price if included
    if (updates.price !== undefined) {
      const numericPrice = Number(updates.price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return customMessage("Invalid price value", {}, 400);
      }
      updates.price = numericPrice;
    }

    // Validate stock if included
    if (updates.stock !== undefined) {
      if (typeof updates.stock !== "number") {
        return customMessage("Stock must be a number", {}, 400);
      }
    }

    // Validate category if included
    if (updates.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: updates.categoryId },
      });

      if (!categoryExists) {
        return customMessage("Category does not exist", {}, 400);
      }
    }

    // Sanitize name and description if provided
    if (updates.name) {
      updates.name = sanitizeHtml(updates.name);
    }
    if (updates.description) {
      updates.description = sanitizeHtml(updates.description);
    }

    // Handle images update (expects an array of image objects)

    if (updates.images) {
      if (!Array.isArray(updates.images)) {
        return customMessage("Images must be an array of objects", {}, 400);
      }

      const validImages = updates.images.every(
        (img) => img.publicId && img.public_url
      );

      if (!validImages) {
        return customMessage(
          "Each image must have a valid publicId and public_url",
          {},
          400
        );
      }
    }

    await prisma.product.update({
      where: { id },
      data: updates,
    });

    return customMessage("Product updated successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteProduct = async (req, params) => {
  try {
    const { id } = await params;

    if (!id) {
      return customMessage("Product ID is required", {}, 400);
    }

    if (!isValidUUID(id)) {
      return customMessage("Invalid product ID", {}, 400);
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return customMessage("Product not found", {}, 404);
    }

    await prisma.product.delete({
      where: { id },
    });

    return customMessage("Product deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

export const productControllers = {
  createNewProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
