const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.katasurya.my.id/api";

const getToken = () => localStorage.getItem("community_token");

export function getAvatarUrl(avatarPath) {
  if (!avatarPath) return null;
  if (/^(https?:|blob:|data:)/.test(avatarPath)) return avatarPath;

  const backendBase = API_BASE_URL.replace(/\/api\/?$/, "");

  return `${backendBase}${avatarPath.startsWith("/") ? "" : "/"}${avatarPath}`;
}

const request = async (path, options = {}) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    Accept: "application/json",
    ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.message ||
      Object.values(data.errors || {})?.[0]?.[0] ||
      "Terjadi kesalahan pada server komunitas.";
    throw new Error(message);
  }

  return data;
};

export const communityApi = {
  getStories: (page = 1) => request(`/community/stories?page=${page}`),

  getStory: (id) => request(`/community/stories/${id}`),

  getMyStories: () => request("/community/stories/mine"),

  createStory: (payload) =>
    request("/community/stories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (data) =>
    request("/community/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (credentials) =>
    request("/community/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getMe: () => request("/community/auth/me"),

  updateProfile: (payload) =>
    request("/community/auth/profile", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }),

  logout: async () => {
    try {
      await request("/community/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Gagal logout di server:", error);
    } finally {
      localStorage.removeItem("community_token");
      localStorage.removeItem("community_user");
    }
  },

  getAdminStories: () => request("/community/admin/stories"),

  hideAdminStory: (id) =>
    request(`/community/admin/stories/${id}/hide`, { method: "PATCH" }),

  deleteAdminStory: (id) =>
    request(`/community/admin/stories/${id}`, { method: "DELETE" }),

  banAdminUser: (id) =>
    request(`/community/admin/users/${id}/ban`, { method: "PATCH" }),
};
