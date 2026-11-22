import api from "./api";

export async function getPublicationLikeState(slug) {
  const response = await api.get(`/api/publications/${encodeURIComponent(slug)}/like/`);
  return response.data;
}

export async function togglePublicationLike(slug, liked) {
  const response = liked
    ? await api.delete(`/api/publications/${encodeURIComponent(slug)}/like/`)
    : await api.post(`/api/publications/${encodeURIComponent(slug)}/like/`);
  return response.data;
}

export async function getPublicationComments(publicationId, page = 1) {
  const response = await api.get(`/api/publications/${publicationId}/comments/`, { params: { page } });
  return response.data;
}

export async function createPublicationComment(publicationId, content) {
  const response = await api.post(`/api/publications/${publicationId}/comments/`, { content });
  return response.data;
}

export async function updateComment(commentId, content) {
  const response = await api.patch(`/api/comments/${commentId}/`, { content });
  return response.data;
}

export async function deleteComment(commentId) {
  await api.delete(`/api/comments/${commentId}/`);
}

export async function getPublicProfile(username) {
  const response = await api.get(`/api/auth/profiles/${encodeURIComponent(username)}/`);
  return response.data;
}

export async function toggleFollow(username, following) {
  const response = following
    ? await api.delete(`/api/auth/profiles/${encodeURIComponent(username)}/follow/`)
    : await api.post(`/api/auth/profiles/${encodeURIComponent(username)}/follow/`);
  return response.data;
}

export async function getFollowList(username, relation, page = 1) {
  const response = await api.get(`/api/auth/profiles/${encodeURIComponent(username)}/${relation}/`, { params: { page } });
  return response.data;
}


export async function getMyCommunityProfile() {
  const response = await api.get("/api/auth/me/profile/");
  return response.data;
}

export async function updateMyCommunityProfile(formData) {
  const response = await api.patch("/api/auth/me/profile/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
