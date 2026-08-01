import api from "../services/reqInterceptor.js";

// Get all users (admin only)
const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

const userService = {
  getUsers,
};

export default userService;
