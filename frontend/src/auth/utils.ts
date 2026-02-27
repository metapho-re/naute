const getBase64Url = (bytes: Uint8Array): string => {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const getCodeVerifier = (): string => {
  const array = new Uint8Array(64);

  crypto.getRandomValues(array);

  return getBase64Url(array);
};

export const getCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return getBase64Url(new Uint8Array(digest));
};

export const getJwtPayload = (token: string): Record<string, unknown> => {
  const base64Url = token.split(".")[1];
  const base64Standard = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64Standard)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );

  return JSON.parse(jsonPayload);
};

export const isTokenExpired = (token: string): boolean => {
  const payload = getJwtPayload(token);
  const exp = payload.exp as number;

  return Date.now() >= exp * 1000;
};
