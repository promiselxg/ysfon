import axios from "axios";
/**
 * Uploads an array of image files to Cloudinary.
 *
 * @param {Object} files - The files to be uploaded.
 * @param {string} cloudinaryUrl - The Cloudinary API URL.
 * @param {string} uploadPreset - The Cloudinary upload preset.
 * @param {string} apiKey - The Cloudinary API key.
 * @param {HTMLElement} submitButton - (Optional) The submit button to show progress.
 * @returns {Promise<Array>} - A promise resolving to an array of uploaded file data.
 */
export const uploadImagesToCloudinary = async (
  files,
  cloudinaryUrl,
  uploadPreset,
  apiKey,
  onProgressUpdate
) => {
  if (!files || Object.keys(files).length === 0) return [];

  const timestamp = Math.floor(Date.now() / 1000);

  // To track progress percentages for all files
  const progressPercentages = Array.from({
    length: Object.keys(files).length,
  }).fill(0);

  const uploads = Object.values(files).map(async (file, index) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("timestamp", timestamp);
    formData.append("api_key", apiKey);

    const response = await axios.post(cloudinaryUrl, formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        // Update progress percentages array
        progressPercentages[index] = percentCompleted;

        // Call the onProgressUpdate callback to report progress
        if (onProgressUpdate) {
          onProgressUpdate(index, percentCompleted);
        }
      },
    });
    return response.data;
  });

  const photos = await Promise.all(uploads);

  // Return uploaded photos and progress percentages
  return { photos, progressPercentages };
};
