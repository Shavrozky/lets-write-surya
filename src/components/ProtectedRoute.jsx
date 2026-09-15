// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { auth } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  if (!auth.isAuthenticated()) {
    // Jika belum login, tendang ke halaman login
    return <Navigate to="/login" replace />;
  }

  return children;
}
