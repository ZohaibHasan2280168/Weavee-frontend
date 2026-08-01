export function debugToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.log("[Debug] No token in localStorage");
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    console.log("[Debug] Token payload:", payload);
    console.log("[Debug] Token expires at:", new Date(payload.exp * 1000).toLocaleString());
    console.log("[Debug] Current time:", new Date(now * 1000).toLocaleString());
    console.log("[Debug] Expired? ", payload.exp < now);
  } catch (err) {
    console.error("[Debug] Failed to decode token:", err.message);
  }
}
