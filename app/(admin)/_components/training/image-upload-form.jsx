"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useImageContext } from "@/context/imageUpload.context";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import FileUpload from "@/components/image/file-upload";

const ImageFileUploadForm = ({ initialData, courseId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { uploadedFile, uploadStatus, setUploadStatus, setSelectedImages } =
    useImageContext();

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setUploadStatus("pending");
    setSelectedImages([]);
  };

  useEffect(() => {
    if (uploadStatus === "completed") {
      setIsEditing(false);
    }
  }, [uploadStatus]);

  return (
    <>
      <div className="mt-6 border bg-slate-100 rounded-md p-4 transition-all">
        <div className="font-medium flex items-center justify-between">
          Course image
          <Button
            variant="ghost"
            onClick={() => toggleEdit()}
            className=" cursor-pointer flex items-center"
          >
            {isEditing ? (
              <>Cancel</>
            ) : (
              <>
                <PlusCircle className="mt-1 h-4 w-4 cursor-pointer" />
                add an image
              </>
            )}
          </Button>
        </div>

        {isEditing && <FileUpload courseId={courseId} />}
        {!isEditing && initialData.asset && (
          <Image
            src={
              uploadedFile.length > 0 && uploadedFile[0]?.secure_url
                ? uploadedFile[0].secure_url
                : initialData.asset.publicUrl
            }
            alt="uploaded image"
            width={100}
            height={110}
            className={`object-contain w-full ${
              uploadedFile.length > 0 ? "h-[110px]" : "h-[110px]"
            } border-[2px] border-[--primary-btn] p-[2px] rounded-[5px] cursor-pointer`}
          />
        )}
      </div>
    </>
  );
};

export default ImageFileUploadForm;
