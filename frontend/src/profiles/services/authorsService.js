
import api from "../../services/api";

function getImageUrl(image) {
  if (!image) return null;

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return new URL(
    image.replace(/^\/+/, ""),
    `${api.defaults.baseURL}/`
  ).href;
}

function normalizeAuthor(author) {
  return {
    id: author.id,
    fullName: author.full_name || "Author",
    penName: author.pen_name || "",
    headline: author.headline || "Author & Literary Contributor",
    biography: author.biography || "",
    profileImage: getImageUrl(author.profile_image),
    coverImage: getImageUrl(author.cover_image),
    email: author.email || "",
    location: author.location || "",
    website: author.website || "",
    facebook: author.facebook || "",
    instagram: author.instagram || "",
    youtube: author.youtube || "",
  };
}

export async function getAuthors() {
  const response = await api.get("/api/authors/", {
  skipAuth: true,
});
  const payload = response.data;

  const authors = Array.isArray(payload)
    ? payload
    : payload.results || [];

  return authors.map(normalizeAuthor);
}

export async function getAuthorById(id) {
  const authors = await getAuthors();

  return authors.find(
    (author) => String(author.id) === String(id)
  ) || null;
}

export async function getPrimaryAuthor() {
  const authors = await getAuthors();
  return authors[0] || null;
}
