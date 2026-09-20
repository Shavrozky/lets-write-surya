import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCommunityAuth } from "../context/CommunityAuthContext";
import { communityApi } from "../services/communityApi";

export default function CreatorGoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authenticate } = useCommunityAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Menukar kode login sementara...",
  );
  const exchangedCodeRef = useRef(null);

  useEffect(() => {
    const code = searchParams.get("code");

    console.log("[CreatorGoogleCallback] mounted", {
      currentUrl: window.location.href,
      hasCode: Boolean(code),
      codePreview: code ? `${code.slice(0, 8)}...` : null,
    });

    if (!code) {
      setErrorMessage("Kode Google OAuth tidak ditemukan.");
      return;
    }

    if (exchangedCodeRef.current === code) {
      console.log("[CreatorGoogleCallback] exchange skipped", {
        reason: "code already exchanged in this render tree",
      });
      return;
    }

    exchangedCodeRef.current = code;
    setStatusMessage("Menukar kode login sementara...");

    communityApi
      .exchangeGoogleCode(code)
      .then((data) => {
        console.log("[CreatorGoogleCallback] exchange success", {
          hasToken: Boolean(data.token),
          user: data.user,
        });

        authenticate({ token: data.token, user: data.user });
        setStatusMessage("Berhasil masuk. Mengalihkan ke ruang penulis...");

        window.setTimeout(() => {
          navigate("/creator", { replace: true });
        }, 600);
      })
      .catch((error) => {
        console.error("[CreatorGoogleCallback] exchange failed", error);
        setErrorMessage(error.message);
      });
  }, [authenticate, navigate, searchParams]);

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-neutral-200 bg-white p-6 text-center shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
        Google OAuth
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold">
        Menghubungkan akun...
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral-500">
        {statusMessage}
      </p>

      {errorMessage && (
        <>
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {errorMessage}
          </div>
          <Link
            to="/creator/auth"
            className="mt-5 inline-flex rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Kembali ke login
          </Link>
        </>
      )}
    </div>
  );
}
