import api from '../services/reqInterceptor';

const uploadToCloudinary = async (file, orderId, contextType) => {

  const sigRes = await api.post("/upload/signature", {
    contextType,
    orderId
  });

  const { timestamp, signature, folder, apiKey, cloudName } = sigRes.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await uploadRes.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type
  };
};

export const uploadChatMediaToCloudinary = async (file, chatRoomId) => {
  const sigRes = await api.post("/upload/signature", {
    contextType: "chat",
    chatRoomId,
  });

  const { timestamp, signature, folder, apiKey, cloudName } = sigRes.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await uploadRes.json();

  if (!uploadRes.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
  };
};

export const uploadAvatarToCloudinary = async (file) => {
  const sigRes = await api.post("/upload/signature", {
    contextType: "profile",
  });

  const { timestamp, signature, folder, apiKey, cloudName } = sigRes.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await uploadRes.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type
  };
};

export const uploadCarouselImageToCloudinary = async (file) => {
  const sigRes = await api.post("/upload/signature", {
    contextType: "carousel",
  });

  const { timestamp, signature, folder, apiKey, cloudName } = sigRes.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await uploadRes.json();

  if (data.error) {
    throw new Error(data.error.message || "Cloudinary upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type
  };
};

export default uploadToCloudinary;
