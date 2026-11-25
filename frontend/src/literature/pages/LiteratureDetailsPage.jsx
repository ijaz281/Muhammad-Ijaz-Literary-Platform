
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
} from "lucide-react";

import {
  getPublicationBySlug,
} from "../services/literatureService";

import LiteratureContent from "../components/LiteratureContent";
import PublicationEngagement from "../components/PublicationEngagement";

export default function LiteratureDetailsPage() {
  const { slug } = useParams();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPublication() {
      try {
        setLoading(true);
        setError("");

        const result = await getPublicationBySlug(slug);

        if (active) {
          setPublication(result);

          if (!result) {
            setError("تحریر نہیں ملی۔");
          }
        }
      } catch (err) {
        console.error("Publication details error:", err);

        if (active) {
          setError("یہ تحریر لوڈ نہیں ہو سکی۔");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPublication();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 text-center text-gray-500">
        تحریر لوڈ ہو رہی ہے...
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="px-6 py-32 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {error || "تحریر نہیں ملی۔"}
        </h2>

        <Link
          to="/literature"
          className="mt-6 inline-block font-semibold text-amber-700"
        >
          ادب کی جانب واپس جائیں
        </Link>
      </div>
    );
  }

  const isUrdu = publication.language === "ur";

  const formattedDate = publication.publishedAt
    ? new Date(publication.publishedAt).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "";

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gray-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/literature"
            className="mb-10 inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
          >
            <ArrowLeft size={18} />
            ادب پر واپس جائیں
          </Link>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-amber-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              {publication.category}
            </span>

            {publication.isFeatured && (
              <span className="text-sm text-amber-300">
                نمایاں تحریر
              </span>
            )}
          </div>

          <h1
            dir={isUrdu ? "rtl" : "ltr"}
            className={`text-3xl font-bold leading-relaxed md:text-5xl ${
              isUrdu ? "text-right font-serif" : ""
            }`}
          >
            {publication.title}
          </h1>

          {formattedDate && (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <CalendarDays size={16} />
              {formattedDate}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        {publication.cover && (
          <div className="mb-14 flex justify-center">
            <img
              src={publication.cover}
              alt={publication.title}
              className="max-h-[450px] w-full rounded-xl object-contain"
            />
          </div>
        )}

        {publication.excerpt && (
          <div
            dir={isUrdu ? "rtl" : "ltr"}
            className="mb-12 rounded-xl border-l-4 border-amber-600 bg-amber-50 p-6 text-lg leading-9 text-gray-700"
          >
            {publication.excerpt}
          </div>
        )}

        <div className="mb-10 flex items-center gap-3 border-b pb-5">
          <BookOpen className="text-amber-700" size={22} />

          <h2 className="text-xl font-bold text-gray-900">
            تحریر پڑھیے
          </h2>
        </div>

        <LiteratureContent item={publication} />

        <PublicationEngagement publicationId={publication.id} slug={publication.slug} />

        <div className="mt-16 border-t pt-8">
          <Link
            to="/literature"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-amber-700"
          >
            <ArrowLeft size={18} />
            مزید ادب دیکھیے
          </Link>
        </div>
      </section>
    </main>
  );
}
