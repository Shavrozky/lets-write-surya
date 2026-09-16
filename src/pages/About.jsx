// src/pages/About.jsx
import { ExternalLink } from "lucide-react";

export default function About() {
  return (
    <main className="max-w-[680px] mx-auto px-4 sm:px-5 py-10 sm:py-16">
      <h1 className="font-serif text-[34px] sm:text-5xl font-bold tracking-tight text-proseText mb-7 sm:mb-8 leading-tight">
        Tentang katasurya.
      </h1>

      <div className="prose font-serif text-proseText leading-[1.8] sm:leading-[1.85] text-[18px] sm:text-[20px] max-w-none space-y-5 sm:space-y-6">
        <p>
          Kadang-kadang, dunia terlalu bising untuk mendengar apa yang
          sebenarnya ingin kita sampaikan. Ada kalimat-kalimat yang tidak pernah
          selesai diucapkan di percakapan sehari-hari, dan akhirnya hanya
          tertinggal sebagai draf yang urung dikirim.
        </p>

        <p>
          <strong>katasurya.my.id</strong> lahir dari kegelisahan itu. Ini
          adalah ruang suaka untuk merangkai monolog, fragmen ingatan, dan
          cerita fiksi yang mungkin tidak memiliki panggung di linimasa media
          sosial yang serba cepat.
        </p>

        <blockquote className="border-l-2 border-neutral-400 pl-5 my-8 italic text-neutral-600">
          "Menulis cerita adalah cara paling jujur untuk mengingat hal-hal yang
          hampir kita lupakan."
        </blockquote>

        <p>
          Setiap tulisan di sini dirancang untuk dibaca dengan tenang. Tanpa
          interupsi iklan, tanpa animasi yang berlebihan—hanya kata demi kata,
          seperti membalik halaman buku di sudut kamar saat larut malam.
        </p>

        <div className="mt-12 pt-8 border-t border-proseBorder font-sans text-sm">
          <h2 className="font-semibold text-base mb-2">Sisi Lain Penulis</h2>
          <p className="text-proseMuted leading-relaxed mb-4">
            Di luar kata-kata dan narasi fiksi, saya banyak berkutat dengan
            rekayasa sistem, machine learning, dan kode program. Karya-karya
            teknis dan arsitektur perangkat lunak saya dokumentasikan terpisah
            di:
          </p>

          <a
            href="https://portfolio.katasurya.my.id"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-medium underline text-proseText hover:text-neutral-600 transition-colors break-words"
          >
            <span>Kunjungi portfolio.katasurya.my.id</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </main>
  );
}
