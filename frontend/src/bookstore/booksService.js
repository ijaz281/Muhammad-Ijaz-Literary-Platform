
import api from "../services/api";

function getImageUrl(image) {
  if (!image) return null;

  if (/^https?:\/\//i.test(image)) return image;

  return new URL(
    image.replace(/^\/+/, ""),
    `${api.defaults.baseURL}/`
  ).href;
}

export function normalizeBook(book) {
  const authors = Array.isArray(book.authors)
    ? book.authors
    : [];

  const authorNames = authors
    .map((item) =>
      typeof item === "string"
        ? item
        : item.author_name || item.pen_name || item.name
    )
    .filter(Boolean);

  return {
    id: book.id,
    title: book.title || "Untitled Book",
    slug: book.slug,
    author: authorNames.join(", ") || "Author",
    description:
      book.short_description ||
      book.description ||
      "Discover this literary work.",
    cover: getImageUrl(book.cover_image),
    category: book.category_name || "Literature",
    categorySlug: book.category_slug,
    language: book.language || "",
    format: book.book_format || "",
    price: book.current_price ?? book.price ?? null,
    originalPrice: book.price ?? null,
    isFeatured: Boolean(book.is_featured),
    inStock: book.is_in_stock,
  };
}

function extractBooks(payload) {
  if (Array.isArray(payload)) return payload;

  return payload?.results ||
    payload?.data ||
    payload?.books ||
    [];
}

export async function getAllBooks(params = {}) {
  const response = await api.get("/api/books/", {
  params,
  skipAuth: true,
});
  const payload = response.data;
  const books = extractBooks(payload);

  return {
    books: books.map(normalizeBook),
    count: payload?.count ?? books.length,
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
  };
}

export async function getBookBySlug(slug) {
  const result = await getAllBooks({ page_size: 100 });

  return result.books.find(
    (book) =>
      String(book.slug) === String(slug) ||
      String(book.id) === String(slug)
  ) || null;
}
