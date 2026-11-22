
import api from "./api";

function getImageUrl(image) {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return new URL(image, `${api.defaults.baseURL}/`).href;
}

function normalizeBook(book) {
  const authors = Array.isArray(book.authors)
    ? book.authors
    : [];

  const authorNames = authors
    .map((item) => item.author_name || item.pen_name)
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
    language: book.language,
    format: book.book_format,
    price: book.current_price,
    originalPrice: book.price,
    isFeatured: book.is_featured,
    inStock: book.is_in_stock,
  };
}

export async function getFeaturedBooks() {
  const response = await api.get("/api/books/", {
    params: {
      featured: "true",
      page_size: 4,
    },
    skipAuth: true,
  });

  const payload = response.data;

  const books = Array.isArray(payload)
    ? payload
    : payload.results || [];

  return books.map(normalizeBook);
}

export async function getAllBooks(params = {}) {
  const response = await api.get("/api/books/", {
    params,
    skipAuth: true,
  });

  const payload = response.data;

  const books = Array.isArray(payload)
    ? payload
    : payload.results || [];

  return {
    books: books.map(normalizeBook),
    count: payload.count ?? books.length,
    next: payload.next ?? null,
    previous: payload.previous ?? null,
  };
}

export default api;
