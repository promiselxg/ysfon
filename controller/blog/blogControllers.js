import { customMessage, ServerError } from "@/lib/utils/customMessage";
import prisma from "@/lib/utils/dbConnect";
import { isValidUUID } from "@/lib/utils/validateUUID";
import sanitizeHtml from "sanitize-html";

const createNewBlogCategory = async (req, res) => {
  try {
    const { name } = await req.json();
    if (!name) {
      return customMessage("Category name is required", {}, 400);
    }
    const nameExist = await prisma.blogCategory.findFirst({
      where: { name },
    });

    if (nameExist) {
      return customMessage("Category already exists", {}, 409);
    }

    const category = await prisma.blogCategory.create({
      data: { name },
    });

    return customMessage("Category created successfully", { category }, 201);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const createNewBlogPost = async (req, res) => {
  try {
    const {
      title,
      content,
      categoryId,
      author,
      images,
      isPublished = false,
    } = await req.json();

    if (
      (!title || !content || !categoryId || !author,
      !Array.isArray(images) || images.length === 0)
    ) {
      return customMessage("All fields are required", {}, 400);
    }

    const cleanTitle = sanitizeHtml(title);
    const cleanDescription = sanitizeHtml(content);

    if (!isValidUUID(categoryId)) {
      return customMessage("Invalid Category ID", {}, 400);
    }

    const categoryExist = await prisma.blogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExist) {
      return customMessage("Category not found or does not exist.", {}, 404);
    }

    if (await prisma.blog.findFirst({ where: { title: cleanTitle } })) {
      return customMessage("Blog post with this title already exists", {}, 409);
    }

    const formattedImages = images.map((img) => {
      if (!img.publicId || !img.public_url) {
        throw new Error("Each image must have publicId and public_url");
      }
      return { publicId: img.publicId, public_url: img.public_url };
    });

    const blog = await prisma.blog.create({
      data: {
        title: cleanTitle,
        content: cleanDescription,
        category: { connect: { id: categoryId } },
        author,
        isPublished,
        images: formattedImages,
      },
    });

    return customMessage("Blog post created successfully", { blog }, 201);
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

    if (!isValidUUID(id)) {
      return customMessage("Invalid Category ID", {}, 400);
    }

    if (!(await prisma.blogCategory.findUnique({ where: { id } }))) {
      return customMessage("Category not found or does not exist.", {}, 404);
    }

    if (await prisma.blogCategory.findFirst({ where: { name } })) {
      return customMessage("Category already exists", {}, 409);
    }

    const category = await prisma.blogCategory.update({
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
    const categories = await prisma.blogCategory.findMany({
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

const getAllBlogs = async (req) => {
  const query = req.nextUrl.searchParams;

  const page = parseInt(query.get("page")) || 1;
  const limit = parseInt(query.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const search = query.get("search")?.trim().toLowerCase();

  let categoryId = query.get("categoryId")?.trim();
  categoryId = isValidUUID(categoryId) ? categoryId : null;

  let isPublished = query.get("isPublished")?.trim();
  isPublished =
    isPublished === "true" || isPublished === "false"
      ? isPublished === "true"
      : null;

  try {
    //  dynamic filters
    const filters = {};

    if (search) {
      filters.OR = [{ title: { contains: search } }];
    }

    if (categoryId) {
      filters.categoryId = categoryId;
      filters.isPublished = true;
    }

    if (isPublished !== null) {
      filters.isPublished = isPublished;
    }

    // Fetch filtered products
    const blogPost = await prisma.blog.findMany({
      where: filters,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        images: true,
        category: { select: { id: true, name: true } },
      },
    });

    const totalCount = await prisma.blog.count({ where: filters });

    return customMessage(
      "Blog Posts retrieved successfully",
      { count: blogPost.length, totalCount, blogPost },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getSigleBlogPost = async (req, params) => {
  const { id } = await params;
  if (!id) {
    return customMessage("Post ID is required", {}, 400);
  }

  if (!isValidUUID(id)) {
    return customMessage("Invalid Post ID", {}, 400);
  }

  try {
    const blogPost = await prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        images: true,
        category: { select: { id: true, name: true } },
      },
    });

    if (!blogPost) {
      return customMessage("Post not found", {}, 404);
    }

    if (blogPost && Array.isArray(blogPost.images)) {
      blogPost.images = blogPost.images.map((img) => ({
        public_url: img.public_url,
      }));
    }

    return customMessage("Post found", { blogPost }, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateBlogPost = async (req, params) => {
  try {
    const { id } = await params;
    const updates = await req.json();

    if (!id) {
      return customMessage("Post ID is required", {}, 400);
    }

    if (!isValidUUID(id)) {
      return customMessage("Invalid product ID", {}, 400);
    }

    if (
      !(await prisma.blog.findUnique({
        where: { id },
      }))
    ) {
      return customMessage("Post not found", {}, 404);
    }

    // Ensure updates contain at least one valid field
    if (Object.keys(updates).length === 0 || updates === null) {
      return customMessage("No update fields provided", {}, 400);
    }

    // Validate category if included
    if (updates.categoryId) {
      const categoryExists = await prisma.blogCategory.findUnique({
        where: { id: updates.categoryId },
      });

      if (!categoryExists) {
        return customMessage("Blog Category does not exist", {}, 400);
      }
    }

    // Sanitize name and description if provided
    if (updates.title) {
      updates.title = sanitizeHtml(updates.title);
    }
    if (updates.content) {
      updates.content = sanitizeHtml(updates.content);
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

    await prisma.blog.update({
      where: { id },
      data: updates,
    });

    return customMessage(`Updated successfully`, {}, 200);
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
    if (!isValidUUID(id)) {
      return customMessage("Invalid Category ID", {}, 400);
    }
    const categoryExist = await prisma.blogCategory.findUnique({
      where: { id },
      include: { blogs: true },
    });

    if (!categoryExist) {
      return customMessage("Category not found or does not exist.", {}, 404);
    }

    // Delete all BLOGS under the category
    await prisma.blog.deleteMany({
      where: { categoryId: id },
    });

    // delete the category
    await prisma.blogCategory.delete({
      where: { id },
    });

    return customMessage("Category deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteBlogPost = async (req, params) => {
  try {
    const { id } = await params;

    if (!id) {
      return customMessage("Post ID is required", {}, 400);
    }

    if (!isValidUUID(id)) {
      return customMessage("Invalid post ID", {}, 400);
    }

    const blogPost = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blogPost) {
      return customMessage("Post not found", {}, 404);
    }

    await prisma.blog.delete({
      where: { id },
    });

    return customMessage("Post deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

export const blogControllers = {
  createNewBlogCategory,
  createNewBlogPost,
  updateCategory,
  updateBlogPost,
  getAllCategories,
  getAllBlogs,
  getSigleBlogPost,
  deleteCategory,
  deleteBlogPost,
};
