import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  BookOpen,
  Feather,
  LoaderCircle,
} from "lucide-react";

import Container from "../components/ui/Container";
import { getAllBooks } from "../services/booksService";
import { getAllPublications } from "../literature/services/literatureService";

function getItems(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [books, setBooks] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [bookResponse, literatureResponse] = await Promise.all([
          getAllBooks({ page_size: 100 }),
          getAllPublications({ page_size: 100 }),
        ]);

        if (!active) return;

        setBooks(getItems(bookResponse));
        setPublications(getItems(literatureResponse));
      } catch {
        if (active) {
          setError("Unable to load search results. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredBooks = books.filter((book) =>
    [
      book.title,
      book.author,
      book.description,
      book.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );

  const filteredPublications = publications.filter((item) =>
    [
      item.title,
      item.excerpt,
      item.content,
      item.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );

  function handleSearch(event) {
    event.preventDefault();

    const value = query.trim();

    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  }

  const hasQuery = normalizedQuery.length > 0;

  return (
    <main className="min-h-screen bg-[#f8f7f3] py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-literary-gold">
            Explore the Collection
          </p>

          <h1 className="mt-4 font-serif text-4xl font-bold text-literary-navy sm:text-6xl">
            Search
          </h1>

          <p className="mt-5 leading-8 text-gray-600">
            Find books, publications and literary ideas.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-9 flex border border-gray-300 bg-white p-2 shadow-sm"
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search books and literature..."
              className="min-w-0 flex-1 px-4 py-3 outline-none"
            />

            <button
              type="submit"
              className="flex items-center gap-2 bg-literary-navy px-5 py-3 font-semibold text-white transition hover:bg-literary-gold hover:text-literary-navy"
            >
              <Search size={18} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center py-24">
            <LoaderCircle
              className="animate-spin text-literary-gold"
              size={38}
            />
          </div>
        )}

        {error && (
          <p className="mt-12 text-center text-red-600">{error}</p>
        )}

        {!loading && !error && !hasQuery && (
          <div className="py-20 text-center text-gray-500">
            <Search className="mx-auto mb-4" size={40} />
            Enter a keyword to explore the collection.
          </div>
        )}

        {!loading && !error && hasQuery && (
          <div className="mt-14 space-y-16">
            <section>
              <div className="mb-7 flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="flex items-center gap-3 font-serif text-2xl font-bold text-literary-navy">
                  <BookOpen className="text-literary-gold" />
                  Books
                </h2>

                <span className="text-sm text-gray-500">
                  {filteredBooks.length} results
                </span>
              </div>

              {filteredBooks.length === 0 ? (
                <p className="py-8 text-gray-500">
                  No matching books found.
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBooks.map((book) => (
                    <Link
                      key={book.id || book.slug}
                      to={`/books/${book.slug}`}
                      className="border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-literary-gold">
                        {book.category || "Book"}
                      </p>

                      <h3 className="mt-3 font-serif text-xl font-bold text-literary-navy">
                        {book.title}
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        {book.author || "Muhammad Ijaz Ul Haq"}
                      </p>

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-gray-600">
                        {book.description || "Explore this literary work."}
                      </p>

                      <span className="mt-5 inline-block text-sm font-bold text-literary-navy">
                        View Book →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-7 flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="flex items-center gap-3 font-serif text-2xl font-bold text-literary-navy">
                  <Feather className="text-literary-gold" />
                  Literature
                </h2>

                <span className="text-sm text-gray-500">
                  {filteredPublications.length} results
                </span>
              </div>

              {filteredPublications.length === 0 ? (
                <p className="py-8 text-gray-500">
                  No matching publications found.
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPublications.map((item) => (
                    <Link
                      key={item.id || item.slug}
                      to={`/literature/${item.slug}`}
                      className="border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-literary-gold">
                        {item.category || "Publication"}
                      </p>

                      <h3 className="mt-3 font-serif text-xl font-bold text-literary-navy">
                        {item.title}
                      </h3>

                      <p className="mt-4 line-clamp-4 text-sm leading-7 text-gray-600">
                        {item.excerpt || "Explore this literary publication."}
                      </p>

                      <span className="mt-5 inline-block text-sm font-bold text-literary-navy">
                        Read More →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </Container>
    </main>
  );
}