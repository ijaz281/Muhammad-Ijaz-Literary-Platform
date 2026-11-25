
import { useEffect, useMemo, useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { getAllPublications } from "../services/literatureService";
import LiteratureGrid from "../components/LiteratureGrid";

export default function LiteraturePage() {
  const [publications, setPublications] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPublications() {
      try {
        setLoading(true);
        setError("");

        const result = await getAllPublications({
          page_size: 100,
        });

        if (active) {
          setPublications(result.publications);
        }
      } catch (err) {
        console.error("Literature API error:", err);

        if (active) {
          setError(
            "ادبی تحریریں لوڈ نہیں ہو سکیں۔ براہِ کرم اپنا کنکشن چیک کریں۔"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPublications();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        publications.map((item) => item.category)
      ),
    ];
  }, [publications]);

  const filteredPublications = useMemo(() => {
    const query = search.toLowerCase().trim();

    return publications.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query);

      const matchesCategory =
        category === "all" ||
        item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [publications, search, category]);

  return (
    <main>
      <section className="bg-gray-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <BookOpen className="mb-6 text-amber-400" size={42} />

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
            ادبی ذخیرہ
          </p>

          <h1 className="text-4xl font-bold md:text-6xl">
            ادب اور اشاعتیں
          </h1>

          <p className="mt-6 max-w-2xl leading-8 text-gray-300">
            شاعری، ادبی تحریروں اور اشاعتوں کا مطالعہ کیجیے۔
            بامعنی الفاظ اور تخلیقی اظہار دریافت کیجیے۔
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-5 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ادب میں تلاش کریں..."
              className="w-full rounded-xl border px-12 py-4 outline-none focus:border-amber-600"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border px-5 py-4 outline-none focus:border-amber-600"
          >
            <option value="all">تمام اصناف</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            ادبی مواد لوڈ ہو رہا ہے...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-600">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-7 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                ادبی ذخیرہ
              </h2>

              <span className="text-sm text-gray-500">
                {filteredPublications.length} publications
              </span>
            </div>

           <LiteratureGrid items={filteredPublications} />
          </>
        )}
      </section>
    </main>
  );
}
