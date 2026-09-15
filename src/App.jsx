// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import StoryDetail from "./pages/StoryDetail";
import About from "./pages/About";
import WriteStory from "./pages/WriteStory";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AmbientPlayer from "./components/AmbientPlayer";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-proseText flex flex-col relative">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tentang" element={<About />} />
            <Route path="/cerita/:slug" element={<StoryDetail />} />

            {/* Rute Login Eksklusif */}
            <Route path="/login" element={<Login />} />

            {/* Rute Write Terproteksi (Hanya Bisa Dibuka Jika Sudah Login) */}
            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <WriteStory />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <AmbientPlayer />
      </div>
    </Router>
  );
}
