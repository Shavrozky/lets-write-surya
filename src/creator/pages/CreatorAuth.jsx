import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { communityApi } from "../services/communityApi";
import { useCommunityAuth } from "../context/CommunityAuthContext";

export default function CreatorAuth() {
  const navigate = useNavigate();
  const { authenticate } = useCommunityAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signin";
  const isSignup = mode === "signup";
  const [form, setForm] = useState({
    name: "",
    pen_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = isSignup
        ? form
        : { email: form.email, password: form.password };
      const data = isSignup
        ? await communityApi.register(payload)
        : await communityApi.login(payload);

      authenticate({ token: data.token, user: data.user });
      navigate("/creator");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
        {isSignup ? "Mulai Menulis" : "Masuk Penulis"}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold">
        {isSignup ? "Buat akun Aksara." : "Masuk ke Aksara."}
      </h1>

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {isSignup && (
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            required
            placeholder="Nama"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
          />
        )}

        {isSignup && (
          <input
            name="pen_name"
            value={form.pen_name}
            onChange={handleChange}
            type="text"
            placeholder="Nama pena opsional"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
          />
        )}

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
        />

        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
          required
          placeholder="Password"
          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-950"
        />

        <button
          disabled={loading}
          className="w-full rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Memproses..." : isSignup ? "Sign up" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-neutral-500">
        {isSignup ? "Sudah punya akun?" : "Belum punya akun?"} {" "}
        <Link
          to={`/creator/auth?mode=${isSignup ? "signin" : "signup"}`}
          className="font-medium text-neutral-950 underline"
        >
          {isSignup ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
