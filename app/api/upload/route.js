import { customMessage, ServerError } from "@/lib/utils/customMessage";
import prisma from "@/lib/utils/dbConnect";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const POST = async (req) => {
  try {
    // ✅ Parse the request as `multipart/form-data`
    const formData = await req.formData();
    const file = formData.get("file");
    const courseId = formData.get("courseId");
    const name = formData.get("name");

    if (!file || !courseId) {
      return customMessage("File or course ID missing", {}, 400);
    }

    // ✅ Convert `file` to Base64
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString("base64");
    const dataUri = `data:${file.type};base64,${fileBase64}`;

    // ✅ Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      resource_type: "raw",
      folder: "ysfon/docs",
    });

    // ✅ Save to Prisma database
    const attachment = await prisma.attachment.create({
      data: {
        courseId,
        name,
        asset: {
          assetId: uploadResponse.asset_id,
          publicUrl: uploadResponse.secure_url,
          publicId: uploadResponse.public_id,
          resourceType: uploadResponse.resource_type,
        },
      },
    });
    return customMessage("File uploaded successfully", attachment, 200);
  } catch (error) {
    console.error("Error uploading file:", error);
    return ServerError(error, {}, 500);
  }
};
