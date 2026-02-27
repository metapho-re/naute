import type { Note } from "@naute/shared";
import { useEffect, useState } from "react";

import { useApiClient } from "./use-api-client";

interface ReturnValue {
  error: string | null;
  isLoading: boolean;
  note: Note | null;
}

export const useNote = (id: string | undefined): ReturnValue => {
  const api = useApiClient();

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setNote(null);

      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    (async function () {
      try {
        setNote(await api.getNote(id, controller.signal));
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
  }, [id, api]);

  return { error, isLoading, note };
};
