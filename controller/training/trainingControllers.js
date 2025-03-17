import prisma from "@/lib/utils/dbConnect";
import { isValidUUID } from "@/lib/utils/validateUUID";
import sanitize from "sanitize-html";

const { customMessage, ServerError } = require("@/lib/utils/customMessage");

const createNewCourse = async (req) => {
  try {
    const { title, userId } = await req.json();
    if (!title) {
      return customMessage("Course Title is required", {}, 400);
    }

    if (!userId) {
      return customMessage("User ID is required", {}, 400);
    }

    if (typeof title !== "string") {
      return customMessage("Course title must be a string", {}, 400);
    }

    if (!isValidUUID(userId)) {
      return customMessage("Invalid user ID", {}, 400);
    }

    const sanitizedName = sanitize(title);

    const courseTitleExist = await prisma.course.findFirst({
      where: { title: sanitizedName },
    });

    if (courseTitleExist) {
      return customMessage("Course title  already exists", {}, 409);
    }

    if (!(await prisma.user.findUnique({ where: { id: userId } }))) {
      return customMessage("User does not exist", {}, 404);
    }

    const course = await prisma.course.create({
      data: { title: sanitizedName, userId },
    });

    return customMessage(
      "Course created successfully",
      {
        course: { id: course.id, title: course.title, userId: course.userId },
      },
      201
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const createCourseCategory = async (req) => {
  try {
    const { name } = await req.json();
    if (!name) {
      return customMessage("Course category name is required", {}, 400);
    }

    if (typeof name !== "string") {
      return customMessage("Category title must be a string", {}, 400);
    }

    const nameExist = await prisma.courseCategory.findFirst({
      where: { name },
    });

    if (nameExist) {
      return customMessage("Course category already exists", {}, 409);
    }

    const category = await prisma.courseCategory.create({
      data: { name },
    });

    return customMessage(
      "Course category created successfully",
      { category },
      201
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const createCourseChapter = async (req, params) => {
  try {
    const { id } = await params;
    const userId = req.user.id;

    const { title } = await req.json();

    if (!id) {
      return customMessage("Course ID is required", {}, 400);
    }

    if (!title) {
      return customMessage("Chapter title is required", {}, 400);
    }

    if (typeof title !== "string") {
      return customMessage("Chapter title must be a string", {}, 400);
    }

    if (!isValidUUID(id)) {
      return customMessage("Invalid Course ID", {}, 400);
    }
    if (
      await prisma.chapter.findFirst({
        where: { title },
      })
    ) {
      return customMessage("Chapter title already exist.", {}, 400);
    }

    const courseExist = await prisma.course.findUnique({
      where: { id },
    });

    if (!courseExist) {
      return customMessage("Course not found", {}, 404);
    }

    if (courseExist.userId !== userId) {
      return customMessage(
        "Unauthorized: you do not have the required permission to perform this action",
        {},
        401
      );
    }

    const lastChapter = await prisma.chapter.findFirst({
      where: {
        courseId: id,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const sanitizedTitle = sanitize(title);

    const chapter = await prisma.chapter.create({
      data: {
        title: sanitizedTitle,
        position: newPosition,
        courseId: id,
      },
    });

    return customMessage(
      "Course chapter created successfully",
      { chapter },
      201
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateCategory = async (req, params) => {
  const { id } = await params;
  if (!id) {
    return customMessage("Course category ID is required", {}, 400);
  }
  try {
    const { name } = await req.json();
    if (!name) {
      return customMessage("Course category name is required", {}, 400);
    }

    if (typeof name !== "string") {
      return customMessage("Course category name must be a string", {}, 400);
    }

    const category = await prisma.courseCategory.update({
      where: { id },
      data: { name },
    });
    return customMessage(
      "Course category updated successfully",
      { category },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateCourse = async (req, params) => {
  try {
    const { id } = await params;
    const updates = await req.json();

    if (!id) {
      return customMessage("Course ID is required", {}, 400);
    }

    if (!isValidUUID(id)) {
      return customMessage("Invalid Course ID", {}, 400);
    }

    if (
      !(await prisma.course.findUnique({
        where: { id },
      }))
    ) {
      return customMessage("Course not found", {}, 404);
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

    // Validate category if included
    if (updates.categoryId) {
      const categoryExists = await prisma.courseCategory.findUnique({
        where: { id: updates.categoryId },
      });

      if (!categoryExists) {
        return customMessage("Course Category does not exist", {}, 400);
      }

      updates.category = {
        connect: { id: updates.categoryId },
      };
      delete updates.categoryId; // Ensure no direct string assignment
    }

    // Sanitize name and description if provided
    if (updates.title) {
      updates.title = sanitize(updates.title);
    }
    if (updates.description) {
      updates.description = sanitize(updates.description);
    }

    if (updates.isPublished) {
      if (typeof updates.isPublished !== "boolean") {
        throw new Error("isPublished must be a boolean");
      }
      updates.isPublished = updates.isPublished;
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

    await prisma.course.update({
      where: { id },
      data: updates,
    });

    return customMessage("Course updated successfully", {}, 200);
  } catch (error) {
    console.log(error);
    return customMessage("Something went wrong", { error: error.message }, 500);
  }
};

const updateCourseChapter = async (req, params) => {
  try {
    const { chapterId, id } = await params;

    const userId = req.user.id;
    const updates = await req.json();

    if (!chapterId) {
      return customMessage("Chapter ID is required", {}, 400);
    }

    if (!updates.title) {
      return customMessage("Chapter Title is required", {}, 400);
    }

    if (!isValidUUID(id) || !isValidUUID(chapterId)) {
      return customMessage("Invalid Chapter ID or Course ID", {}, 400);
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return customMessage("Chapter not found", {}, 404);
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return customMessage("Course not found", {}, 404);
    }

    if (course.userId !== userId) {
      return customMessage(
        "Unauthorized: you do not have the required permission to perform this action",
        {},
        401
      );
    }

    if (
      await prisma.chapter.findFirst({
        where: {
          title: sanitize(updates.title),
        },
      })
    ) {
      return customMessage("Chapter title already exist.", {}, 409);
    }
    // Sanitize title if provided
    if (updates.title) {
      updates.title = sanitize(updates.title);
    }

    await prisma.chapter.update({
      where: { id: chapterId },
      data: updates,
    });

    return customMessage("Course Chapter updated successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getAllCategories = async () => {
  try {
    const categories = await prisma.courseCategory.findMany({
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

const getAllCourses = async (req) => {
  const query = req.nextUrl.searchParams;

  const page = parseInt(query.get("page")) || 1;
  const limit = parseInt(query.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const search = query.get("search")?.trim().toLowerCase();

  let isPublished = query.get("isPublished")?.trim();
  isPublished =
    isPublished === "true" || isPublished === "false"
      ? isPublished === "true"
      : null;

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
      filters.OR = [{ name: { contains: search } }];
    }

    if (minPrice !== null || maxPrice !== null) {
      filters.price = {};
      if (minPrice !== null) filters.price.gte = minPrice;
      if (maxPrice !== null) filters.price.lte = maxPrice;
    }

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    if (isPublished !== null) {
      filters.isPublished = isPublished;
    }

    //  Fetch filtered products
    const courses = await prisma.course.findMany({
      where: filters,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        createdAt: true,
        imageUrl: true,
        isPublished: true,
        category: { select: { id: true, name: true } },
        chapters: true,
        attachments: true,
      },
    });

    const totalCount = await prisma.course.count({ where: filters });

    return customMessage(
      "Courses retrieved successfully",
      { count: courses.length, totalCount, courses },
      200
    );
  } catch (error) {
    console.log(error);
    return ServerError(error, {}, 500);
  }
};

const getSingleCourse = async (req, params) => {
  const { id } = await params;

  const userId = req.user.id;

  if (!id) {
    return customMessage("course ID is required", {}, 400);
  }

  if (!isValidUUID(id)) {
    return customMessage("Invalid course ID", {}, 400);
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id, userId },
      include: {
        chapters: {
          orderBy: {
            position: "asc",
          },
        },
        attachments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!course) {
      return customMessage("Course not found", {}, 404);
    }

    return customMessage("Course found", { course }, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteCategory = async (req, params) => {
  const { id } = await params;

  if (!id) {
    return customMessage("Category ID is required", {}, 400);
  }

  if (!isValidUUID(id)) {
    return customMessage("Invalid Category ID", {}, 400);
  }

  try {
    const categoryExist = await prisma.courseCategory.findUnique({
      where: { id },
      include: { courses: true },
    });

    if (!categoryExist) {
      return customMessage("Category not found or does not exist.", {}, 404);
    }

    // Delete all courses under the category
    await prisma.course.deleteMany({
      where: { categoryId: id },
    });

    // delete the category
    await prisma.courseCategory.delete({
      where: { id },
    });

    return customMessage("Course category deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteCourse = async (req, params) => {
  const { id } = await params;
  const userId = req.user.id;

  if (!id || !userId) {
    return customMessage("Missing required fields.", {}, 400);
  }

  if (!isValidUUID(id) || !isValidUUID(userId)) {
    return customMessage("Invalid Course ID or User ID", {}, 400);
  }

  try {
    const courseExist = await prisma.course.findUnique({
      where: { id },
    });

    if (!courseExist) {
      return customMessage("Course not found or does not exist.", {}, 404);
    }

    // delete the category
    await prisma.course.delete({
      where: { id, userId },
    });

    return customMessage("Course deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteCourseChapter = async (req, params) => {
  const { chapterId, id } = await params;
  const userId = req.user.id;

  if (!id || !userId || !chapterId) {
    return customMessage("Missing required fields.", {}, 400);
  }

  if (!isValidUUID(id) || !isValidUUID(userId)) {
    return customMessage("Invalid Course Chapter ID or User ID", {}, 400);
  }

  try {
    const chapterExist = await prisma.course.findUnique({
      where: { id },
    });

    if (!chapterExist) {
      return customMessage(
        "Course chapter not found or does not exist.",
        {},
        404
      );
    }

    await prisma.chapter.delete({
      where: { id: chapterId, courseId: id },
    });

    return customMessage("Course chapter deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

export const trainingControllers = {
  createNewCourse,
  createCourseCategory,
  createCourseChapter,
  updateCategory,
  updateCourse,
  updateCourseChapter,
  getAllCategories,
  getAllCourses,
  getSingleCourse,
  deleteCategory,
  deleteCourse,
  deleteCourseChapter,
};
