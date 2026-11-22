
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LiteratureCard({ item }) {
  const title = item?.title || "Untitled Publication";
  const slug = item?.slug;
  const excerpt = item?.excerpt || "";
  const category = item?.category || "Literature";
  const language = item?.language || "ur";

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-literary-gold hover:shadow-xl">
      <div className="h-1.5 bg-literary-gold" />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-800">
            {category.replaceAll("_", " ")}
          </span>

          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {language === "ur" ? "Urdu" : "English"}
          </span>
        </div>

        <h3
          dir={language === "ur" ? "rtl" : "ltr"}
          className="mb-3 font-serif text-xl font-bold leading-relaxed text-literary-navy"
        >
          {title}
        </h3>

        <p
          dir={language === "ur" ? "rtl" : "ltr"}
          className="mb-6 flex-1 text-sm leading-7 text-gray-600"
        >
          {excerpt || "Discover this literary publication and explore its content."}
        </p>

        {slug ? (
          <Link
            to={`/literature/${slug}`}
            className="inline-flex items-center gap-2 font-semibold text-amber-700 transition-colors hover:text-amber-900"
          >
            Read Publication
            <ArrowRight size={17} />
          </Link>
        ) : (
          <span className="text-sm text-gray-400">
            Details unavailable
          </span>
        )}
      </div>
    </article>
  );
}
