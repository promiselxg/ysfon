import { useImageContext } from "@/context/imageUpload.context";
import React from "react";
import { RenderImages } from "./selectedImageDisplay";
import { Button } from "../ui/button";
import { ImageIcon, Loader2 } from "lucide-react";

const FileUpload = ({ courseId }) => {
  const {
    files,
    selectedImages,
    handleImageChange,
    removeSelectedImage,
    handleImageUpload,
    loading,
    uploadStatus,
  } = useImageContext();

  return (
    <div className="w-full flex mt-2">
      {/* Case 1: No selected images */}
      {selectedImages.length < 1 && uploadStatus !== "completed" && (
        <div className="shared-folder-empty border border-dashed p-[30px] rounded-[8px] border-[rgba(0,0,0,0.5)] w-full cursor-pointer">
          <div className="flex flex-col cursor-pointer justify-center">
            <label
              htmlFor="files"
              className="w-full cursor-pointer flex justify-center flex-col items-center"
            >
              <ImageIcon
                size={40}
                className="cursor-pointer text-[rgba(0,0,0,0.8)]"
              />
              <div className="my-2 flex flex-col justify-center items-center leading-tight text-center">
                <p className="text-sm text-[rgba(0,0,0,0.8)]">
                  Browse an image
                </p>
              </div>
            </label>
          </div>
          <input
            type="file"
            name="files"
            id="files"
            accept="image/png, image/gif, image/jpeg"
            onChange={(event) =>
              uploadStatus === "completed" ? null : handleImageChange(event, 1)
            }
            className="hidden"
          />
        </div>
      )}

      {/* Case 2: Images selected and ready for upload */}
      {selectedImages.length > 0 && uploadStatus !== "completed" && (
        <div className="flex flex-col w-full">
          <div className="w-full gap-3">
            <RenderImages
              source={selectedImages}
              type="file"
              onRemoveImage={removeSelectedImage}
              files={files}
              handleImageChange={handleImageChange}
              loading={loading}
              uploadStatus={uploadStatus}
            />
          </div>
          <Button
            variant="ghost"
            className="w-full bg-[#177ddc] hover:bg-[#095cb5] link-transition mt-5 disabled:cursor-not-allowed cursor-pointer"
            onClick={() => handleImageUpload(files, courseId)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Uploading...
              </>
            ) : (
              <>Upload Image ({selectedImages?.length})</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
