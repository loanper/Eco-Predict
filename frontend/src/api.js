import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.userMessage = "Serveur EcoPredict injoignable. Vérifiez que le backend est lancé.";
    } else if (err.response.status === 503) {
      err.userMessage = err.response.data?.detail || "Service temporairement indisponible.";
    } else {
      err.userMessage = err.response.data?.detail || "Une erreur est survenue.";
    }
    return Promise.reject(err);
  }
);

export async function postPredict(homeData) {
  const { data } = await api.post("/predict", homeData);
  return data;
}

export async function postChat(homeData, message) {
  const { data } = await api.post("/chat", { home: homeData, message });
  return data;
}

export default api;
