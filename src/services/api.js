const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.katasurya.my.id/api";

export const deleteStory = async (slug, token) => {
  const res = await fetch(`${API_BASE_URL}/stories/${slug}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Gagal menghapus cerita dari server.");
  }

  return res.json();
};

export const updateStory = async (slug, payload, token) => {
  const response = await fetch(`${API_BASE_URL}/stories/${slug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Gagal memperbarui cerita");
  return response.json();
};
