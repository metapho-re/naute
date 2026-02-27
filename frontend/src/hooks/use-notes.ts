import type { NoteSummary } from "@naute/shared";
import { useEffect, useState } from "react";

import { useApiClient } from "./use-api-client";

interface ReturnValue {
  error: string | null;
  isLoading: boolean;
  notes: NoteSummary[];
}

export const useNotes = (): ReturnValue => {
  const api = useApiClient();

  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    (async function () {
      try {
        setNotes(await api.listNotes(controller.signal));
      } catch (e: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [api]);

  return { error, isLoading, notes };
};
