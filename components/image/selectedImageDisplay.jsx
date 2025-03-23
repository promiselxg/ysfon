"use client";

import React from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import { useImageContext } from "@/context/imageUpload.context";

const SelectedImagesDisplay = ({ source, onRemoveImage }) => {
  return source?.map((image, i) => (
    <div
      className="w-full h-[60px] rounded-md relative mb-5   bg-contain"
      key={i}
    >
      {type === "file" && (
        <X
          className="absolute -top-2 -right-2 bg-[rgba(0,0,0,0.9)] rounded-full text-white p-[5px]  cursor-pointer"
          onClick={() => onRemoveImage(i)}
        />
      )}
      <Image
        src={image}
        alt={`images ${i}`}
        width={200}
        height={100}
        className="object-contain h-[60px]"
      />
    </div>
  ));
};

const ImageCard = ({ image, type, onRemoveImage, index }) => {
  const { uploadStatus, loading } = useImageContext();
  return (
    <div
      className="w-full h-[110px] rounded-md relative mb-5 bg-contain imageWrapper link-transition overflow-hidden"
      key={index}
    >
      {type === "file" && uploadStatus !== "completed" && !loading && (
        <div className="imageBtn">
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white cursor-pointer z-10">
            <FiTrash2
              className="cursor-pointer"
              onClick={() => onRemoveImage(index)}
              size={20}
            />
          </div>
        </div>
      )}
      <Image
        src={image}
        alt={`Image ${index}`}
        width={200}
        height={200}
        className="object-cover h-[110px] border-[2px] border-[--primary-btn] p-[2px] rounded-[5px] cursor-pointer"
      />
    </div>
  );
};

export const RenderImages = ({
  source,
  type,
  onRemoveImage,
  files,
  handleImageChange,
  loading,
  uploadStatus,
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {source?.map((image, index) => (
        <ImageCard
          key={index}
          image={image}
          type={type}
          onRemoveImage={onRemoveImage}
          index={index}
          fileName={files[index]?.name}
        />
      ))}
      {!loading && uploadStatus !== "completed" && (
        <div className="h-[110px] border border-dashed p-2 rounded-[8px] border-[rgba(0,0,0,0.2)] w-full cursor-pointer items-center flex justify-center">
          <div className="flex flex-col cursor-pointer justify-center items-center">
            <label
              htmlFor="files"
              className="w-full cursor-pointer flex justify-center flex-col items-center leading-tight"
            >
              <FiPlus
                size={35}
                className="cursor-pointer text-[rgba(0,0,0,0.8)]"
              />
              <div className="flex flex-col justify-center items-center leading-tight">
                <p className="text-sm text-[rgba(0,0,0,0.8)]">Add image</p>
              </div>
            </label>
          </div>
          <input
            type="file"
            name="files"
            id="files"
            accept="image/png, image/gif, image/jpeg"
            onChange={(event) => handleImageChange(event, 8)}
            multiple
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default SelectedImagesDisplay;
