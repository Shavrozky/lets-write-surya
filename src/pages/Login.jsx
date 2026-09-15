// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../utils/auth";
import { ArrowLeft, Lock, Loader2, Feather } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal masuk.");
      }

      // Simpan session login
      auth.login(data.token, data.author);

      // Arahkan langsung ke editor cerita
      navigate("/write");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="max-w-[380px] w-full">
        {/* Tombol Balik ke Beranda */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-sans text-proseMuted hover:text-proseText mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header Login */}
        <div className="mb-8">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-800">
            <Feather size={20} />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-proseText">
            Ruang Penulis
          </h1>
          <p className="font-sans text-xs text-proseMuted mt-1.5 leading-relaxed">
            Akses eksklusif untuk menerbitkan naskah dan mengelola cerita di
            katasurya.
          </p>
        </div>

        {/* Pesan Error */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs font-sans">
            {errorMessage}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Email Penulis
            </label>
            <input
              type="email"
              required
              placeholder="surya@katasurya.my.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md outline-none focus:border-neutral-900 text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md outline-none focus:border-neutral-900 text-xs transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-neutral-900 hover:bg-neutral-800 text-white py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Lock size={13} />
            )}
            <span>{loading ? "Memverifikasi..." : "Masuk ke Studio"}</span>
          </button>
        </form>

        <p className="mt-8 text-center font-sans text-[11px] text-neutral-400">
          katasurya.my.id • Ruang Fiksi Personal
        </p>
      </div>
    </div>
  );
}
