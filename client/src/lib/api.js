import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let getAccessToken = () => null;
let setAccessToken = () => {};

export function configureApiTokenHandlers(get, set) {
  getAccessToken = get;
  setAccessToken = set;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (!original || original._retry) {
      return Promise.reject(error);
    }
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
    if (original.url?.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }
    original._retry = true;
    if (!refreshPromise) {
      refreshPromise = api
        .post("/api/auth/refresh")
        .then((res) => {
          const at = res.data.accessToken;
          setAccessToken(at);
          return at;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }
    try {
      await refreshPromise;
      original.headers.Authorization = `Bearer ${getAccessToken()}`;
      return api(original);
    } catch {
      setAccessToken(null);
      window.dispatchEvent(new Event("algoverse:auth-clear"));
      return Promise.reject(error);
    }
  }
);
