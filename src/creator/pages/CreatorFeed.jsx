import { useEffect, useState } from "react";
import { communityApi } from "../services/communityApi";
import CreatorStoryCard from "../components/CreatorStoryCard";

export default function CreatorFeed() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    communityApi
      .getStories()
      .then((data) => {
        if (isMounted) {
          setStories(data.data || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <section className="border-b border-neutral-200 pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          Ruang Komunal
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-neutral-950">
          Cerita dari para penulis Aksara.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Baca draf, tulisan pendek, dan kisah reflektif dari komunitas tanpa
          mengganggu arsip utama yang sudah ada.
        </p>
      </section>

      <section className="overflow-hidden border-y border-neutral-200 bg-white">
        {loading && (
          <div className="p-8 text-center text-sm text-neutral-400">
            Memuat cerita komunitas...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="p-8 text-center text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && stories.length === 0 && (
          <div className="p-8 text-center">
            <p className="font-serif text-2xl font-bold text-neutral-900">
              Belum ada cerita komunitas.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Jadilah penulis pertama yang menerbitkan kisah di Aksara.
            </p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          stories.map((story) => (
            <CreatorStoryCard key={story.id} story={story} />
          ))}
      </section>
    </div>
  );
}
