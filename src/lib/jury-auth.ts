const TOKEN_KEY = "hfn_jury_token";

export function getJuryToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setJuryToken(token: string) {
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearJuryToken() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(TOKEN_KEY);
}

export function juryAuthHeaders(): HeadersInit {
  const token = getJuryToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
