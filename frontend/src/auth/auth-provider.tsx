import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { env } from "../env";

import { AuthContext } from "./auth-context";
import {
  getCodeChallenge,
  getCodeVerifier,
  getJwtPayload,
  isTokenExpired,
} from "./utils";

const CODE_VERIFIER_KEY = "naute_code_verifier";

interface TokenData {
  access_token: string;
  id_token: string;
}

const authRequest = async (
  path: string,
  body?: Record<string, string>,
): Promise<TokenData | null> => {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "POST",
    credentials: "include",
    ...(body
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as { data: TokenData };

  return json.data;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);

  const applyTokens = useCallback((data: TokenData) => {
    setAccessToken(data.access_token);

    const payload = getJwtPayload(data.id_token);

    if (typeof payload.email === "string") {
      setUser(payload.email);
    }

    setIsAuthenticated(true);
  }, []);

  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshRequest = (async () => {
      try {
        const data = await authRequest("/auth/refresh");

        if (!data) {
          return null;
        }

        applyTokens(data);

        return data.access_token;
      } catch {
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = refreshRequest;

    return refreshRequest;
  }, [applyTokens]);

  useEffect(() => {
    (async function () {
      try {
        await refreshAccessToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshAccessToken]);

  const login = useCallback(async () => {
    const verifier = getCodeVerifier();
    const challenge = await getCodeChallenge(verifier);

    sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.cognitoClientId,
      redirect_uri: env.redirectUri,
      scope: "openid email profile",
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location.href = `${env.cognitoDomain}/oauth2/authorize?${params}`;
  }, []);

  const handleCallback = useCallback(
    async (code: string) => {
      setIsLoading(true);

      try {
        const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);

        sessionStorage.removeItem(CODE_VERIFIER_KEY);

        if (!verifier) {
          throw new Error("Missing code verifier");
        }

        const data = await authRequest("/auth/token", {
          code,
          code_verifier: verifier,
          redirect_uri: env.redirectUri,
        });

        if (!data) {
          throw new Error("Token exchange failed");
        }

        applyTokens(data);
      } finally {
        setIsLoading(false);
      }
    },
    [applyTokens],
  );

  const logout = useCallback(async () => {
    try {
      await authRequest("/auth/logout");
    } catch {
      // proceed with local cleanup regardless
    }

    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);

    const params = new URLSearchParams({
      client_id: env.cognitoClientId,
      logout_uri: env.logoutUri,
    });

    window.location.href = `${env.cognitoDomain}/logout?${params}`;
  }, []);

  const getAccessToken = useCallback(async () => {
    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }

    return refreshAccessToken();
  }, [accessToken, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated,
        isLoading,
        user,
        getAccessToken,
        handleCallback,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
