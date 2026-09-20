import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { communityApi, getGoogleOAuthRedirectUrl } from "../services/communityApi";
import { useCommunityAuth } from "../context/CommunityAuthContext";
import FeedbackModal from "../components/FeedbackModal";

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
  const [feedback, setFeedback] = useState(null);
  const oauthError = searchParams.get("oauth_error");

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

    console.log("[CreatorAuth] submit", {
      mode,
      isSignup,
      email: form.email,
      hasPassword: Boolean(form.password),
    });

    try {
      const payload = isSignup
        ? form
        : { email: form.email, password: form.password };
      const data = isSignup
        ? await communityApi.register(payload)
        : await communityApi.login(payload);

      console.log("[CreatorAuth] auth success", {
        hasToken: Boolean(data.token),
        user: data.user,
      });

      authenticate({ token: data.token, user: data.user });
      setFeedback({
        tone: "success",
        eyebrow: isSignup ? "Akun dibuat" : "Berhasil masuk",
        title: isSignup ? "Akun Aksara berhasil dibuat." : "Kamu berhasil masuk.",
        message: isSignup
          ? "Akunmu siap dipakai untuk menulis dan menerbitkan cerita."
          : "Selamat datang kembali di ruang menulis Aksara.",
        confirmLabel: "Lanjut ke komunitas",
        nextPath: "/creator",
      });
    } catch (err) {
      console.error("[CreatorAuth] auth failed", err);
      setErrorMessage(err.message);
      setFeedback({
        tone: "danger",
        eyebrow: isSignup ? "Gagal membuat akun" : "Gagal masuk",
        title: isSignup ? "Akun belum berhasil dibuat." : "Login belum berhasil.",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const redirectUrl = getGoogleOAuthRedirectUrl();

    console.log("[CreatorAuth] google redirect", {
      redirectUrl,
      currentUrl: window.location.href,
    });

    window.location.assign(redirectUrl);
  };

  const displayedError =
    errorMessage ||
    (oauthError === "account_banned"
      ? "Akun ini sedang dibatasi dan tidak dapat masuk."
      : oauthError
        ? "Gagal masuk dengan Google. Coba beberapa saat lagi."
        : "");

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
      <FeedbackModal
        feedback={feedback}
        onClose={() => setFeedback(null)}
        onPrimary={() => {
          const nextPath = feedback?.nextPath;
          setFeedback(null);
          if (nextPath) navigate(nextPath);
        }}
      />

      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
        {isSignup ? "Mulai Menulis" : "Masuk Penulis"}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold">
        {isSignup ? "Buat akun Aksara." : "Masuk ke Aksara."}
      </h1>

      {displayedError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {displayedError}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
      >
        <span className="text-base font-bold text-blue-600">G</span>
        Lanjutkan dengan Google
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        atau
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
