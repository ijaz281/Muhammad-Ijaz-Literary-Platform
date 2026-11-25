
import api from "./api";

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

export function normalizePublication(item) {
  return {
    id: item.id,
    title: item.title || "بلا عنوان تحریر",
    slug: item.slug,
    category: item.category || "literature",
    language: item.language || "ur",
    excerpt: item.excerpt || "",
    content: item.content || "",
    cover: getImageUrl(item.cover_image),
    isFeatured: Boolean(item.is_featured),
    publishedAt: item.published_at,
    commentsCount: item.comments_count ?? 0,
  };
}

export async function getAllPublications(params = {}) {
  const response = await api.get(
    "/api/literature/publications/",
    {
      params,
      skipAuth: true,
    }
  );

  const payload = response.data;

  const publications = Array.isArray(payload)
    ? payload
    : payload.results || [];

  return {
    publications: publications.map(normalizePublication),
    count: payload.count ?? publications.length,
    next: payload.next ?? null,
    previous: payload.previous ?? null,
  };
}

export async function getPublicationBySlug(slug) {
  const result = await getAllPublications({
    page_size: 100,
  });

  return (
    result.publications.find(
      (item) =>
        String(item.slug) === String(slug) ||
        String(item.id) === String(slug)
    ) || null
  );
}
