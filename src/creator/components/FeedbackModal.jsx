import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

const toneStyles = {
  success: {
    icon: CheckCircle2,
    iconClass: "bg-emerald-50 text-emerald-700",
    buttonClass: "bg-neutral-950 text-white hover:bg-neutral-800",
  },
  danger: {
    icon: AlertTriangle,
    iconClass: "bg-red-50 text-red-700",
    buttonClass: "bg-red-600 text-white hover:bg-red-700",
  },
  info: {
    icon: Info,
    iconClass: "bg-neutral-100 text-neutral-800",
    buttonClass: "bg-neutral-950 text-white hover:bg-neutral-800",
  },
};

export default function FeedbackModal({ feedback, onClose, onPrimary }) {
  if (!feedback) return null;

  const style = toneStyles[feedback.tone || "info"] || toneStyles.info;
  const Icon = style.icon;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-neutral-950/40 px-4 py-8 font-sans backdrop-blur-sm">
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative w-full max-w-sm rounded-[28px] border border-white/70 bg-white p-6 text-neutral-950 shadow-2xl">
        <button
          type="button"
          aria-label="Tutup modal"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X size={16} />
        </button>

        <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-full ${style.iconClass}`}>
          <Icon size={22} />
        </div>

        {feedback.eyebrow && (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            {feedback.eyebrow}
          </p>
        )}

        <h2 className="font-serif text-2xl font-bold leading-tight">
          {feedback.title}
        </h2>

        {feedback.message && (
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            {feedback.message}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          {feedback.secondaryLabel && (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              {feedback.secondaryLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onPrimary || onClose}
            className={`w-full rounded-full px-5 py-2.5 text-sm font-medium transition ${style.buttonClass}`}
          >
            {feedback.confirmLabel || "Mengerti"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
