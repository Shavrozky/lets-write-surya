// src/App.jsx
import { lazy, Suspense, useEffect } from "react";
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
import CreatorGoogleCallback from "./creator/pages/CreatorGoogleCallback";
import CreatorStories from "./creator/pages/CreatorStories";
import CreatorStoryDetail from "./creator/pages/CreatorStoryDetail";
import CreatorAdmin from "./creator/pages/CreatorAdmin";
import CreatorAdminUsers from "./creator/pages/CreatorAdminUsers";
import CreatorProfile from "./creator/pages/CreatorProfile";
import { CommunityAuthProvider } from "./creator/context/CommunityAuthContext";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";

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
          <Route path="auth/google/callback" element={<CreatorGoogleCallback />} />
          <Route path="profile" element={<CreatorProfile />} />
          <Route path="stories" element={<CreatorStories />} />
          <Route path="stories/:id" element={<CreatorStoryDetail />} />
          <Route path="admin" element={<CreatorAdmin />} />
          <Route path="admin/users" element={<CreatorAdminUsers />} />
        </Route>
      </Routes>
    </div>
  );
}

function AppFrame() {
  const location = useLocation();
  const { isOpen, closeSidebar } = useSidebar();
  const isReaderRoute =
    location.pathname.startsWith("/cerita/") ||
    location.pathname.startsWith("/creator/stories/");

  // Otomatis tutup drawer di layar kecil ketika berpindah halaman
  useEffect(() => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  }, [location.pathname]);

  if (isReaderRoute) {
    return (
      <CommunityAuthProvider>
        <div className="min-h-screen bg-neutral-100/60 text-neutral-950">
          <Navbar />
          <AnimatedRoutes />
        </div>
        <AmbientPlayer />
      </CommunityAuthProvider>
    );
  }

  return (
    <CommunityAuthProvider>
      <div className="min-h-screen bg-white text-neutral-950">
        <Navbar />

        {/* Mobile Backdrop Overlay */}
        <div
          onClick={closeSidebar}
          className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          aria-hidden="true"
        />

        {/* Mobile Drawer Slide-over */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden flex flex-col p-5 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex-1 overflow-y-auto">
            <AppSidebar />
          </div>
        </aside>

        {/* Layout Konten Utama dengan Desktop Sidebar Animasi Mulus */}
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-5 lg:px-6">
          <div
            className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
              isOpen
                ? "w-60 opacity-100"
                : "w-0 -mr-6 opacity-0 pointer-events-none"
            }`}
          >
            <div className="w-60">
              <AppSidebar />
            </div>
          </div>

          <main className="min-w-0 flex-1 transition-all duration-300">
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
      <SidebarProvider>
        <AppFrame />
      </SidebarProvider>
    </Router>
  );
}
