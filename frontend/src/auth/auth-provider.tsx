import {
  type PropsWithChildren,
  useCallback,
  useEffect,
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

let refreshToken: string | null = null;

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);

  const getRefreshedAccessToken = useCallback(async () => {
    if (!refreshToken) {
      return null;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${env.cognitoDomain}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: env.cognitoClientId,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        refreshToken = null;

        return null;
      }

      const data = await response.json();

      setAccessToken(data.access_token);

      if (data.id_token) {
        const payload = getJwtPayload(data.id_token);

        setUser(payload.email as string);
      }

      setIsAuthenticated(true);

      return data.access_token;
    } catch {
      refreshToken = null;

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async function () {
      await getRefreshedAccessToken();
    })();
  }, [getRefreshedAccessToken]);

  const login = async () => {
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
  };

  const handleCallback = async (code: string) => {
    setIsLoading(true);

    try {
      const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);

      sessionStorage.removeItem(CODE_VERIFIER_KEY);

      if (!verifier) {
        throw new Error("Missing code verifier");
      }

      const response = await fetch(`${env.cognitoDomain}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: env.cognitoClientId,
          redirect_uri: env.redirectUri,
          code_verifier: verifier,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error("Token exchange failed");
      }

      const data = await response.json();

      setAccessToken(data.access_token);

      refreshToken = data.refresh_token;

      if (data.id_token) {
        const payload = getJwtPayload(data.id_token);

        setUser(payload.email as string);
      }

      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);

    refreshToken = null;

    const params = new URLSearchParams({
      client_id: env.cognitoClientId,
      logout_uri: env.logoutUri,
    });

    window.location.href = `${env.cognitoDomain}/logout?${params}`;
  };

  const getAccessToken = async () => {
    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }

    return getRefreshedAccessToken();
  };

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
