// utils/fileUtils.js
import React from 'react';
import { FiImage, FiVideo, FiFile, FiFileText } from 'react-icons/fi';

export const getFileIcon = (file) => {
  // Handle null/undefined
  if (!file) {
    return <FiFile size={20} />;
  }

  let fileUrl = null;

  if (typeof file === "string") {
    fileUrl = file;
  } 
  else if (file?.url && typeof file.url === "string") {
    fileUrl = file.url;
  }
  else if (file?.fileUrl && typeof file.fileUrl === "string") {
    fileUrl = file.fileUrl;
  }
  else if (file?.secure_url && typeof file.secure_url === "string") {
    fileUrl = file.secure_url;
  }
  else {
    // If we can't extract a URL, return default icon
    return <FiFile size={20} />;
  }

  // Now fileUrl is guaranteed to be a string
  if (/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(fileUrl) || 
      fileUrl.includes('/image/upload/')) {
    return <FiImage size={20} />;
  }
  
  if (/\.(mp4|webm|mov|avi|mkv)$/i.test(fileUrl) || 
      fileUrl.includes('/video/upload/')) {
    return <FiVideo size={20} />;
  }

  return <FiFileText size={20} />;
};
