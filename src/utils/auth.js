// src/utils/auth.js
export const auth = {
  getToken: () => localStorage.getItem("katasurya_token"),

  isAuthenticated: () => {
    const token = localStorage.getItem("katasurya_token");
    return Boolean(token && token.trim() !== "");
  },

  login: (token, author = null) => {
    localStorage.setItem("katasurya_token", token);
    if (author) {
      localStorage.setItem("katasurya_author", JSON.stringify(author));
    }
  },

  logout: () => {
    localStorage.removeItem("katasurya_token");
    localStorage.removeItem("katasurya_author");
  },
};
