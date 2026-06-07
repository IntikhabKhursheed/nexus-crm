const accessTokenKey = "nexuscrm_access_token";
const refreshTokenKey = "nexuscrm_refresh_token";
const themeKey = "nexuscrm_theme";

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(accessTokenKey, accessToken);
  localStorage.setItem(refreshTokenKey, refreshToken);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(accessTokenKey);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(refreshTokenKey);
}

export function clearTokens() {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
}

export function getSavedTheme() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(themeKey) ?? "dark";
}

export function setSavedTheme(theme: "dark" | "light") {
  localStorage.setItem(themeKey, theme);
}
