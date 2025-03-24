import { Loader2, LucideFileUp } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const DocumentFileUpload = ({ courseId }) => {
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (!e?.target?.files) return;
    const file = e.target.files[0];

    e.target.value = "";

    setFiles([]);
    const allowedExtensions = ["txt", "pdf", "doc", "docx"];

    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Only .txt, .pdf, .doc, and .docx files are allowed.");
      return;
    }

    setFiles(file);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    formData.append("name", file.name);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        toast.error("An error occurred while uploading the document.");

      const data = await response.json();
      toast.success("Document uploaded successfully.");
      console.log("Uploaded file:", data);
    } catch (error) {
      toast.error("An error occurred while uploading the document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-4">
        <div className=" space-y-4">
          <label
            htmlFor="files"
            className="flex flex-col items-center cursor-pointer"
          >
            <LucideFileUp size={40} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">
              Browse a document
            </p>
            <p className="text-xs text-muted-foreground italic">
              Include documents you want users to use for this training.
            </p>
          </label>
          <Input
            type="file"
            name="files"
            id="files"
            accept=".txt, .pdf, .doc, .docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-center justify-center mb-2">
            <Button
              onClick={() => handleFileUpload(files)}
              disabled={loading || !files}
              className={`w-fit cursor-pointer flex items-center ${
                loading ? "cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className=" animate-spin" />
                </>
              ) : (
                <>Upload Document</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentFileUpload;
