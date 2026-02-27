import type { CreateNoteRequest, Note, UpdateNoteRequest } from "@naute/shared";
import { useCallback, useState } from "react";

import { useApiClient } from "./use-api-client";

interface ReturnValue {
  error: string | null;
  isSaving: boolean;
  save: (
    id: string | undefined,
    data: CreateNoteRequest | UpdateNoteRequest,
  ) => Promise<Note>;
}

export const useSaveNote = (): ReturnValue => {
  const api = useApiClient();

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (
      id: string | undefined,
      data: CreateNoteRequest | UpdateNoteRequest,
    ) => {
      setIsSaving(true);
      setError(null);

      try {
        if (id) {
          return await api.updateNote(id, data as UpdateNoteRequest);
        }

        return await api.createNote(data as CreateNoteRequest);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));

        throw e;
      } finally {
        setIsSaving(false);
      }
    },
    [api],
  );

  return { error, isSaving, save };
};
