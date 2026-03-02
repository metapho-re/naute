import type { CreateNoteRequest, Note, UpdateNoteRequest } from "@naute/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { noteKeys } from "./query-keys";
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
  const { createNote, updateNote } = useApiClient();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Note,
    Error,
    {
      id: string | undefined;
      data: CreateNoteRequest | UpdateNoteRequest;
    }
  >({
    mutationFn: ({ id, data }) => {
      if (id) {
        return updateNote(id, data as UpdateNoteRequest);
      }

      return createNote(data as CreateNoteRequest);
    },
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });

      if (id) {
        queryClient.invalidateQueries({ queryKey: noteKeys.detail(id) });
      }
    },
  });

  const save = useCallback(
    (id: string | undefined, data: CreateNoteRequest | UpdateNoteRequest) =>
      mutation.mutateAsync({ id, data }),
    [mutation],
  );

  return {
    error: mutation.error ? mutation.error.message : null,
    isSaving: mutation.isPending,
    save,
  };
};
