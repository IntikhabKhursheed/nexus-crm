export const webEnv = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000"
};
