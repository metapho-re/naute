import { useState, useCallback } from "react";

import { useApiClient } from "./use-api-client";

interface ReturnValue {
  error: string | null;
  isDeleting: boolean;
  remove: (id: string) => Promise<void>;
}

export const useDeleteNote = (): ReturnValue => {
  const api = useApiClient();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      setError(null);

      try {
        await api.deleteNote(id);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));

        throw e;
      } finally {
        setIsDeleting(false);
      }
    },
    [api],
  );

  return { error, isDeleting, remove };
};
