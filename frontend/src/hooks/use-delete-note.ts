import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { noteKeys } from "./query-keys";
import { useApiClient } from "./use-api-client";

interface ReturnValue {
  error: string | null;
  isDeleting: boolean;
  remove: (id: string) => Promise<void>;
}

export const useDeleteNote = (): ReturnValue => {
  const { deleteNote } = useApiClient();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: (id) => deleteNote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) });
    },
  });

  const remove = useCallback(
    (id: string) => mutation.mutateAsync(id),
    [mutation],
  );

  return {
    error: mutation.error ? mutation.error.message : null,
    isDeleting: mutation.isPending,
    remove,
  };
};
