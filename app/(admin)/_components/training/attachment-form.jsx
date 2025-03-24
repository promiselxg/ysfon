"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useImageContext } from "@/context/imageUpload.context";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import FileUpload from "@/components/image/file-upload";
import DocumentFileUpload from "@/components/document/file-upload";

const AttachmentForm = ({ initialData, courseId }) => {
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
          Course attachment
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
                add a file
              </>
            )}
          </Button>
        </div>

        {isEditing && <DocumentFileUpload courseId={courseId} />}
        {!isEditing && initialData?.attachments?.length === 0 && (
          <p className="text-sm mt-2 text-slate-500 italic">
            No attachments yet
          </p>
        )}
      </div>
    </>
  );
};

export default AttachmentForm;
