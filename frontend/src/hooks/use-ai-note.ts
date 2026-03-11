import type { AiNoteAction, AiNoteResponse } from "@naute/shared";
import { useCallback, useState } from "react";

import { useApiClient } from "./use-api-client";

interface ReturnValue {
  error: string | null;
  isDialogVisible: boolean;
  isProcessing: boolean;
  hideDialog: () => void;
  process: (payload: string) => Promise<AiNoteResponse | null>;
  showDialog: () => void;
}

const apiMethodMap: Record<AiNoteAction, "formatNote" | "generateNote"> = {
  format: "formatNote",
  generate: "generateNote",
};

export const useAiNote = (action: AiNoteAction): ReturnValue => {
  const apiClient = useApiClient();

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const showDialog = () => {
    setIsDialogVisible(true);
  };

  const hideDialog = () => {
    setError(null);
    setIsDialogVisible(false);
  };

  const process = useCallback(
    async (payload: string) => {
      setIsProcessing(true);
      setError(null);

      try {
        const result = await apiClient[apiMethodMap[action]](payload);

        setIsDialogVisible(false);

        return result;
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : `Failed to ${action} note`;

        setError(message);

        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [action, apiClient],
  );

  return {
    error,
    isDialogVisible,
    isProcessing,
    hideDialog,
    process,
    showDialog,
  };
};
