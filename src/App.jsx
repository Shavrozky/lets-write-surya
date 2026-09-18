// src/App.jsx
import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import AppSidebar from "./components/AppSidebar";
import Home from "./pages/Home";
import StoryDetail from "./pages/StoryDetail";
import About from "./pages/About";
import WriteStory from "./pages/WriteStory";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AmbientPlayer from "./components/AmbientPlayer";
import CreatorLayout from "./creator/CreatorLayout";
import CreatorFeed from "./creator/pages/CreatorFeed";
import CreatorAuth from "./creator/pages/CreatorAuth";
import CreatorStories from "./creator/pages/CreatorStories";
import CreatorStoryDetail from "./creator/pages/CreatorStoryDetail";
import CreatorAdmin from "./creator/pages/CreatorAdmin";
import CreatorProfile from "./creator/pages/CreatorProfile";
import { CommunityAuthProvider } from "./creator/context/CommunityAuthContext";

const CreatorWrite = lazy(() => import("./creator/pages/CreatorWrite"));

function CreatorEditorFallback() {
  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400 shadow-sm">
      Memuat editor...
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
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
        <Route path="/creator" element={<CreatorLayout />}>
          <Route index element={<CreatorFeed />} />
          <Route
            path="write"
            element={
              <Suspense fallback={<CreatorEditorFallback />}>
                <CreatorWrite />
              </Suspense>
            }
          />
          <Route path="auth" element={<CreatorAuth />} />
          <Route path="profile" element={<CreatorProfile />} />
          <Route path="stories" element={<CreatorStories />} />
          <Route path="stories/:id" element={<CreatorStoryDetail />} />
          <Route path="admin" element={<CreatorAdmin />} />
        </Route>
      </Routes>
    </div>
  );
}

function AppFrame() {
  const location = useLocation();
  const isReaderRoute =
    location.pathname.startsWith("/cerita/") ||
    location.pathname.startsWith("/creator/stories/");

  return (
    <CommunityAuthProvider>
      <div className="min-h-screen bg-white text-neutral-950">
        <Navbar />
        <div
          className={`mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-5 lg:px-6 ${
            isReaderRoute ? "md:grid-cols-[220px_minmax(0,1fr)]" : "md:grid-cols-[220px_minmax(0,1fr)]"
          }`}
        >
          <AppSidebar />
          <main className="min-w-0">
            <AnimatedRoutes />
          </main>
        </div>
      </div>
      <AmbientPlayer />
    </CommunityAuthProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AppFrame />
    </Router>
  );
}
