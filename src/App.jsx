// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import StoryDetail from "./pages/StoryDetail";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-proseText flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cerita/:slug" element={<StoryDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
