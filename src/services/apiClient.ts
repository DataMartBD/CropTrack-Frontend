import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL;
const token = window.localStorage.getItem("jwtToken");

// GET
export async function getData<T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T> {
  const response = await axios.get(`${apiBase}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data.data;
}

// POST
export async function postData<T, U>(
  endpoint: string,
  payload: T,
  params: Record<string, any> = {}
): Promise<U> {
  const response = await axios.post(`${apiBase}${endpoint}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    params,
  });
  return response.data;
}

// PUT
export async function putData<T, U>(
  endpoint: string,
  payload: T,
  params: Record<string, any> = {}
): Promise<U> {
  const token = window.localStorage.getItem("jwtToken");
  const response = await axios.put(`${apiBase}${endpoint}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    params,
  });
  return response.data;
}
