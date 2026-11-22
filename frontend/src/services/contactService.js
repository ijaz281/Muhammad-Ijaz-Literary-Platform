
import api from "./api";

export async function sendContactMessage(messageData) {
  const response = await api.post(
    "/api/contact/",
    messageData
  );

  return response.data;
}
