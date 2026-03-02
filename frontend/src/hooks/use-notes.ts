import type { NoteSummary } from "@naute/shared";
import { useQuery } from "@tanstack/react-query";

import { noteKeys } from "./query-keys";
import { useApiClient } from "./use-api-client";

interface ReturnValue {
  error: string | null;
  isLoading: boolean;
  notes: NoteSummary[];
}

export const useNotes = (): ReturnValue => {
  const { listNotes } = useApiClient();

  const { data, error, isLoading } = useQuery<NoteSummary[], Error>({
    queryKey: noteKeys.lists(),
    queryFn: ({ signal }) => listNotes(signal),
  });

  return {
    error: error ? error.message : null,
    isLoading,
    notes: data ?? [],
  };
};
