import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL;

// Configure global axios defaults
axios.defaults.baseURL = apiBase;

// Add a request interceptor to the global axios instance
// This will affect ALL axios requests in the app, including those in other files
axios.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
