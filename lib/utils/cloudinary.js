import cloudinary from "cloudinary";
import { customMessage } from "./customMessage";
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//  Remove uploaded image function
const removeUploadedImage = async (imageArray = [], resourceType = "image") => {
  if (!Array.isArray(imageArray) || imageArray.length === 0) {
    return customMessage("Invalid or empty image array.", 400);
  }

  const publicIds = imageArray.map((img) => img.publicId);

  try {
    await cloudinary.v2.api.delete_resources(publicIds, {
      type: "upload",
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    return customMessage(error?.message || "Error deleting images.", 500);
  }
};

//  upload multiple image function
const cloudinaryImageUploadMethod = async (file, preset) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      { upload_preset: `${preset}` },
      (err, result) => {
        if (err) {
          console.log(err);
        }
        resolve({
          img: result,
        });
      }
    );
  });
};

export { removeUploadedImage, cloudinaryImageUploadMethod };
