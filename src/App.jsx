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

        {/* Rute Write Terproteksi */}
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
          <Route
            path="auth/google/callback"
            element={<CreatorGoogleCallback />}
          />
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

  // Menutup drawer otomatis setiap kali berpindah halaman
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <CommunityAuthProvider>
      <div className="min-h-screen bg-white text-neutral-950 transition-colors duration-300">
        <Navbar />

        <div
          onClick={closeSidebar}
          className={`fixed inset-0 z-40 bg-neutral-950/20 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          aria-hidden="true"
        />

        <aside
          className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-neutral-200/80 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform flex flex-col p-5 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex-1 overflow-y-auto">
            <AppSidebar />
          </div>
        </aside>

        <main className="min-w-0 w-full">
          <AnimatedRoutes />
        </main>
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
