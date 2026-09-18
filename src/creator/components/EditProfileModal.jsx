import { useState } from "react";
import { createPortal } from "react-dom";
import { getAvatarUrl } from "../services/communityApi";

export default function EditProfileModal({ isOpen = true, user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    pen_name: user?.pen_name || "",
    bio: user?.bio || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(getAvatarUrl(user?.avatar) || "");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const displayName = form.pen_name || form.name || "Profil";
  const initial = displayName.charAt(0).toUpperCase() || "A";

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();

      reader.onload = () => {
        setPreviewUrl(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("pen_name", form.pen_name);
      payload.append("bio", form.bio);

      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      await onSave(payload);
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Profil Penulis
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-neutral-950">
              Edit profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Tutup
          </button>
        </div>

        {errorMessage && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 mt-6 flex flex-col items-center">
          <div className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-white shadow-inner">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-serif text-2xl font-bold">{initial}</span>
            )}

            <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-end bg-black/40 pb-1.5 opacity-90 transition hover:bg-black/60">
              <span className="text-[10px] font-medium tracking-tight text-white">
                Ubah Foto
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Nama Lengkap
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={255}
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Nama Pena
            </label>
            <input
              name="pen_name"
              value={form.pen_name}
              onChange={handleChange}
              maxLength={100}
              placeholder="Nama pena opsional"
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-700">
                Bio singkat
              </label>
              <span className="text-[11px] text-neutral-400">
                {form.bio.length}/500
              </span>
            </div>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              maxLength={500}
              rows={3}
              placeholder="Ceritakan sedikit tentang dirimu."
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-2.5 text-sm leading-relaxed text-neutral-950 outline-none transition focus:border-neutral-950"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-medium text-neutral-600 transition hover:text-neutral-950"
            >
              Batal
            </button>
            <button
              disabled={saving}
              className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
