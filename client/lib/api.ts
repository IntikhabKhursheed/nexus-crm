import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";
import { webEnv } from "./env";

export const api = axios.create({
  baseURL: webEnv.apiBaseUrl,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    const nextConfig = config as typeof config & {
      headers: Record<string, string>;
    };
    nextConfig.headers = nextConfig.headers ?? {};
    nextConfig.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as {
      _retry?: boolean;
      headers?: Record<string, string>;
      [key: string]: unknown;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${webEnv.apiBaseUrl}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`
              }
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          setTokens(accessToken, newRefreshToken);
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest as any);
        } catch {
          clearTokens();
        }
      }
    }

    return Promise.reject(error);
  }
);
