import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthContext } from "../auth";

interface ReturnValue {
  error: string | null;
  login: () => void;
}

export const useCallbackPage = (): ReturnValue => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { handleCallback, login } = useContext(AuthContext);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      return;
    }

    (async function () {
      try {
        await handleCallback(code);

        navigate("/notes", { replace: true });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [handleCallback, navigate, searchParams]);

  return { error, login };
};
