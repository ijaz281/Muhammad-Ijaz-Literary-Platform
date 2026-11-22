import api from "./api";

export async function getCart() {
  const response = await api.get("/api/store/cart/");
  return response.data;
}

export async function addToCart(bookId, quantity = 1) {
  const response = await api.post("/api/store/cart/", {
    book_id: bookId,
    quantity,
  });

  return response.data;
}

export async function updateCartItem(itemId, quantity) {
  const response = await api.patch(
    `/api/store/cart/items/${itemId}/`,
    { quantity }
  );

  return response.data;
}

export async function removeCartItem(itemId) {
  await api.delete(`/api/store/cart/items/${itemId}/`);
}

export async function checkout(orderData) {
  const response = await api.post(
    "/api/store/checkout/",
    orderData
  );

  return response.data;
}

export async function getMyOrders() {
  const response = await api.get("/api/store/orders/");
  return response.data;
}