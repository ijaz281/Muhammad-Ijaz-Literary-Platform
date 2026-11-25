
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";
import { getBookBySlug } from "../booksService";

export default function BookDetailsPage() {
  const { slug } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBook() {
      try {
        setLoading(true);
        const result = await getBookBySlug(slug);

        if (active) {
          setBook(result);
          if (!result) setError("کتاب نہیں ملی۔");
        }
      } catch {
        if (active) setError("یہ کتاب لوڈ نہیں ہو سکی۔");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBook();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <div className="py-32 text-center">کتاب لوڈ ہو رہی ہے...</div>;
  }

  if (!book) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-2xl font-bold">{error}</h2>
        <Link to="/books" className="mt-5 inline-block text-amber-700">
          کتب کی جانب واپس جائیں
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <Link
        to="/books"
        className="mb-10 inline-flex items-center gap-2 text-gray-600 hover:text-amber-700"
      >
        <ArrowLeft size={18} />
        کتب پر واپس جائیں
      </Link>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-gray-100 p-8">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="max-h-[550px] w-full rounded-lg object-contain"
            />
          ) : (
            <BookOpen size={100} className="text-gray-400" />
          )}
        </div>

        <div className="py-6">
          <p className="font-semibold uppercase tracking-widest text-amber-700">
            {book.category}
          </p>

          <h1 className="mt-4 text-4xl font-bold text-gray-900">
            {book.title}
          </h1>

          <p className="mt-4 text-lg text-gray-500">
            از {book.author}
          </p>

          <div className="my-8 border-y py-6">
            <p className="text-3xl font-bold text-gray-900">
              {book.price !== null
                ? `Rs. ${book.price}`
                : "قیمت دستیاب نہیں"}
            </p>

            {book.language && (
              <p className="mt-3 text-sm text-gray-600">
                زبان: {book.language}
              </p>
            )}

            {book.format && (
              <p className="mt-2 text-sm text-gray-600">
                فارمیٹ: {book.format}
              </p>
            )}
          </div>

          <h2 className="text-xl font-bold">اس کتاب کے بارے میں</h2>

          <p className="mt-4 whitespace-pre-line leading-8 text-gray-600">
            {book.description}
          </p>
        </div>
      </div>
    </main>
  );
}
