import axios from "axios";
import { TOKEN_KEY, expireSession, isTokenExpired } from "./session";

const apiBase = import.meta.env.VITE_API_BASE_URL;

// Configure global axios defaults
axios.defaults.baseURL = apiBase;

// Endpoints that legitimately answer 401 without meaning "your session died" —
// a wrong password must not be reported as an expired session.
const PUBLIC_ENDPOINTS = ["/user/login/"];

const isPublicEndpoint = (url?: string) =>
  !!url && PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));

// Add a request interceptor to the global axios instance
// This will affect ALL axios requests in the app, including those in other files
axios.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) return config;

    // Expired token: end the session here instead of sending a request that is
    // guaranteed to come back 401.
    if (isTokenExpired(token) && !isPublicEndpoint(config.url)) {
      expireSession("expired");
      return Promise.reject(new Error("Session expired"));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// The server is the final word on token validity — revoked tokens, a restarted
// backend, or a clock the browser disagrees with all surface as a 401 here.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !isPublicEndpoint(error?.config?.url)) {
      expireSession("rejected");
    }
    return Promise.reject(error);
  },
);

// GET
export async function getData<T>(
  endpoint: string,
  params: Record<string, any> = {},
): Promise<T> {
  const response = await axios.get(endpoint, {
    params,
  });
  return response.data.data;
}

// POST
export async function postData<T, U>(
  endpoint: string,
  payload: T,
  params: Record<string, any> = {},
): Promise<U> {
  const response = await axios.post(endpoint, payload, {
    params,
  });
  return response.data;
}

// PUT
export async function putData<T, U>(
  endpoint: string,
  payload: T,
  params: Record<string, any> = {},
): Promise<U> {
  const response = await axios.put(endpoint, payload, {
    params,
  });
  return response.data;
}

// DELETE
export async function deleteData<U>(
  endpoint: string,
  params: Record<string, any> = {},
): Promise<U> {
  const response = await axios.delete(endpoint, {
    params,
  });
  return response.data;
}
