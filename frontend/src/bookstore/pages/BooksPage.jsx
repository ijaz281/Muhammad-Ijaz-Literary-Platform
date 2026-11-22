
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, LoaderCircle, RefreshCw } from "lucide-react";

import { getAllBooks } from "../booksService";
import BookGrid from "../components/BookGrid";
import BookFilters from "../components/BookFilters";
import api from "../../services/api";
import Container from "../../components/ui/Container";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        // Load books and categories independently.
        const [bookResult, categoryResult] = await Promise.allSettled([
          getAllBooks(),

          api.get("/api/categories/", {
            skipAuth: true,
          }),
        ]);

        if (!active) return;

        // Books are essential for this page.
        if (bookResult.status === "rejected") {
          throw bookResult.reason;
        }

        setBooks(bookResult.value.books);

        // Categories are optional.
        if (categoryResult.status === "fulfilled") {
          const payload = categoryResult.value.data;

          const categoryData = Array.isArray(payload)
            ? payload
            : payload.results || payload.data || [];

          setCategories(categoryData);
        } else {
          console.error(
            "Categories loading error:",
            categoryResult.reason
          );

          setCategories([]);
        }
      } catch (err) {
        console.error("Bookstore loading error:", err);

        if (active) {
          setError(
            "Unable to load the bookstore. Please check your backend connection."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [retry]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const title = String(book.title || "").toLowerCase();
      const author = String(book.author || "").toLowerCase();
      const description = String(book.description || "").toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        author.includes(query) ||
        description.includes(query);

      const matchesCategory =
        !category ||
        String(book.categorySlug) === category ||
        String(book.category) === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  function clearFilters() {
    setSearch("");
    setCategory("");
  }

  return (
    <main className="min-h-screen bg-literary-cream">
      <section className="relative overflow-hidden bg-literary-navy py-20 text-white sm:py-28">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-literary-gold/20" />

        <Container>
          <div className="relative max-w-3xl">
            <BookOpen size={42} className="mb-6 text-literary-gold" />

            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-literary-gold">
              Discover Literature
            </p>

            <h1 className="font-serif text-4xl font-bold sm:text-6xl">
              Explore Our Books
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-gray-300 sm:text-base">
              Discover books, explore authors and find literary works
              that inspire imagination, knowledge and creativity.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/literature"
                className="inline-flex items-center border border-white/30 px-6 py-3 text-sm font-semibold transition hover:border-literary-gold hover:text-literary-gold"
              >
                Explore Literature
              </Link>

              <Link
                to="/authors"
                className="inline-flex items-center bg-literary-gold px-6 py-3 text-sm font-bold text-literary-navy transition hover:bg-white"
              >
                Meet the Authors
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <BookFilters
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            categories={categories}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <LoaderCircle
                size={38}
                className="animate-spin text-literary-gold"
              />

              <p className="mt-5 text-sm text-literary-muted">
                Loading our book collection...
              </p>
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-white px-6 py-16 text-center">
              <p className="text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="mt-6 inline-flex items-center gap-2 bg-literary-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-literary-gold hover:text-literary-navy"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-literary-navy">
                    Book Collection
                  </h2>

                  <p className="mt-2 text-sm text-literary-muted">
                    Showing {filteredBooks.length} of {books.length} books
                  </p>
                </div>

                {(search || category) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-literary-gold underline underline-offset-4"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <BookGrid books={filteredBooks} />
            </>
          )}
        </Container>
      </section>
    </main>
  );
}
