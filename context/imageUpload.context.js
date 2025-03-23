"use client";
import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { apiCall } from "@/lib/utils/api";
import { uploadImagesToCloudinary } from "@/lib/utils/uploadImageToCloudinary";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Create context
const ImageContext = createContext();

// Provider component
export const ImageProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("pending");
  const [uploadedFile, setUploadedFile] = useState([]);

  // Handle Image Change
  const handleImageChange = (e, maxFiles) => {
    if (!e?.target?.files) return;

    // Clear previous selections
    setSelectedImages([]);
    setFiles([]);

    const filesArray = Array.from(e.target.files);
    const selectedFiles = [];
    const fileURLs = [];

    if (filesArray.length > maxFiles) {
      toast.error(
        `You can only upload up to ${maxFiles} files simultaneously.`
      );

      e.target.value = "";
      return;
    }

    filesArray.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        // File exceeds size limit
        toast.error(`The file "${file.name}" exceeds the 5MB limit.`);
      } else {
        // File size is valid
        selectedFiles.push(file);
        fileURLs.push(URL.createObjectURL(file));
      }
    });

    // Update state with valid files and their preview URLs
    setFiles(selectedFiles);
    const fileArray = selectedFiles.map((file) => URL.createObjectURL(file));
    setSelectedImages((prevImages) => prevImages.concat(fileArray));

    // Revoke object URLs to free memory
    fileURLs.forEach(URL.revokeObjectURL);
  };

  const handleImageUpload = async (files, courseId) => {
    const cloudinaryUrl =
      "https://api.cloudinary.com/v1_1/promiselxg/image/upload";
    const upload_preset = "ysfon_image";
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    try {
      setLoading(true);
      const { photos } = await uploadImagesToCloudinary(
        files,
        cloudinaryUrl,
        upload_preset,
        apiKey
      );

      const response = await apiCall("PATCH", `/training/course/${courseId}`, {
        photos,
      });

      if (response) {
        setUploadStatus("completed");
        setUploadedFile(photos);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Remove a selected image
  const removeSelectedImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };

  return (
    <ImageContext.Provider
      value={{
        files,
        selectedImages,
        uploadStatus,
        loading,
        handleImageChange,
        removeSelectedImage,
        handleImageUpload,
        setSelectedImages,
        setUploadStatus,
        uploadedFile,
        setFiles,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  return useContext(ImageContext);
};
