import api from "../services/reqInterceptor.js";

// Register user
const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Login user
const login = async ({ email, password, platform = "WEB" }) => {
  const response = await api.post("/auth/login", {
    email,
    password,
    platform,
  });

  // Store token and update Authorization header if backend sends it in body
  if (response.data?.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
  }

  return response.data;
};

// Logout user
const logout = async (fcmToken) => {
  await api.post("/auth/logout", { fcmToken });
  localStorage.removeItem("accessToken");
};

// Update FCM Token
const updateFcmToken = async (token) => {
  const response = await api.post("/auth/update-fcm-token", { token });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  updateFcmToken,
};

export default authService;
