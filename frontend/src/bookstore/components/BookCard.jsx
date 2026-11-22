
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ArrowRight,
  ShoppingBag,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import { addToCart } from "../../services/cartService";
import { isAuthenticated } from "../../services/authService";

export default function BookCard({ book }) {
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const bookUrl = `/books/${book.slug || book.id}`;

  const hasPrice =
    book.price !== null &&
    book.price !== undefined &&
    book.price !== "";

  const authenticated = isAuthenticated();

  async function handleAddToCart() {
    if (!authenticated) {
      setMessage("Please log in before adding books to your cart.");
      setMessageType("error");
      return;
    }

    if (!book.id) {
      setMessage("Book information is incomplete.");
      setMessageType("error");
      return;
    }

    if (book.inStock === false) {
      setMessage("This book is currently out of stock.");
      setMessageType("error");
      return;
    }

    try {
      setAdding(true);
      setMessage("");

      await addToCart(book.id, 1);

      setMessage("Book added to your cart successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("Add to cart error:", error);

      const data = error.response?.data;

      const errorMessage =
        data && typeof data === "object"
          ? Object.values(data).flat()[0]
          : null;

      setMessage(
        String(errorMessage || "Unable to add this book to your cart.")
      );
      setMessageType("error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="book-card-3d group flex h-full flex-col overflow-hidden border border-gray-200 bg-white transition duration-300 hover:border-literary-gold hover:shadow-xl">
      <Link
        to={bookUrl}
        className="book-card-link block overflow-hidden bg-literary-cream"
      >
        <div className="book-card-stage flex h-72 items-center justify-center overflow-hidden">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              loading="lazy"
              className="book-card-cover h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <BookOpen
              size={65}
              strokeWidth={1}
              className="book-card-placeholder text-literary-gold"
            />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-literary-gold">
            {book.category}
          </span>

          {book.inStock === false && (
            <span className="text-xs font-semibold text-red-600">
              Out of stock
            </span>
          )}
        </div>

        <Link to={bookUrl}>
          <h3 className="mt-4 line-clamp-2 font-serif text-xl font-bold text-literary-navy transition hover:text-literary-gold">
            {book.title}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-literary-muted">
          By {book.author}
        </p>

        <p className="mt-4 line-clamp-3 flex-1 text-sm leading-7 text-literary-muted">
          {book.description}
        </p>

        <div className="mt-6 border-t border-gray-100 pt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="font-bold text-literary-navy">
              {hasPrice ? `Rs. ${book.price}` : "Price unavailable"}
            </span>

            <Link
              to={bookUrl}
              className="inline-flex items-center gap-2 text-xs font-bold text-literary-navy transition hover:text-literary-gold"
            >
              View Book
              <ArrowRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || book.inStock === false}
            className="flex w-full items-center justify-center gap-2 bg-literary-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-literary-gold hover:text-literary-navy disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingBag size={17} />
                {book.inStock === false ? "Out of Stock" : "Add to Cart"}
              </>
            )}
          </button>

          {message && (
            <div
              role="status"
              className={`mt-3 flex items-start gap-2 text-xs leading-5 ${
                messageType === "success"
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {messageType === "success" && (
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
              )}

              <span>
                {message}

                {messageType === "error" && !authenticated && (
                  <>
                    {" "}
                    <Link
                      to="/account"
                      className="font-bold underline underline-offset-2"
                    >
                      Login here
                    </Link>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
