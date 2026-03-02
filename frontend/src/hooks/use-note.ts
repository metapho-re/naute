import type { Note } from "@naute/shared";
import { useQuery } from "@tanstack/react-query";

import { noteKeys } from "./query-keys";
import { useApiClient } from "./use-api-client";

interface ReturnValue {
  error: string | null;
  isLoading: boolean;
  note: Note | null;
}

export const useNote = (id: string | undefined): ReturnValue => {
  const { getNote } = useApiClient();

  const { data, error, isLoading } = useQuery<Note, Error>({
    queryKey: noteKeys.detail(id!),
    queryFn: ({ signal }) => getNote(id!, signal),
    enabled: !!id,
  });

  return {
    error: error ? error.message : null,
    isLoading,
    note: data ?? null,
  };
};
