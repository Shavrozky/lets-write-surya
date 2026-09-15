// src/utils/auth.js
export const auth = {
  login: (token, author) => {
    localStorage.setItem("katasurya_token", token);
    localStorage.setItem("katasurya_author", JSON.stringify(author));
  },
  logout: () => {
    localStorage.removeItem("katasurya_token");
    localStorage.removeItem("katasurya_author");
  },
  isAuthenticated: () => {
    return !!localStorage.getItem("katasurya_token");
  },
  getToken: () => {
    return localStorage.getItem("katasurya_token");
  },
};
