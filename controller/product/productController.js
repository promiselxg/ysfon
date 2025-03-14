import { customMessage } from "@/lib/utils/customMessage";
import prisma from "@/lib/utils/dbConnect";
import sanitizeHtml from "sanitize-html";

export const createNewProduct = async (req) => {
  try {
    const { name, description, price, categoryid, stock, image } =
      await req.json();

    if (
      !name ||
      !description ||
      !price ||
      !categoryid.trim() ||
      !image?.publicId
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

    const product = await prisma.product.create({
      data: {
        name: cleanName,
        description: cleanDescription,
        price: numericPrice,
        category: { connect: { id: categoryid } },
        stock: stock || 0,
        images: image,
      },
    });

    return customMessage("Product created successfully", { product }, 200);
  } catch (error) {
    console.log(error);
    return customMessage("Something went wrong", { error: error.message }, 500);
  }
};
