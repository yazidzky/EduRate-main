export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export function api(path: string) {
  // Ensure path begins with '/'
  if (!path.startsWith("/")) path = "/" + path;
  return `${API_BASE}${path}`;
}

export default api;
