import type { GenerateNoteResponse } from "@naute/shared";
import { useState } from "react";

import { useApiClient } from "./use-api-client";

interface ReturnValue {
  error: string | null;
  isGenerateDialogVisible: boolean;
  isGenerating: boolean;
  generate: (prompt: string) => Promise<GenerateNoteResponse | null>;
  hideGenerateDialog: () => void;
  showGenerateDialog: () => void;
}

export const useGenerateNote = (): ReturnValue => {
  const { generateNote } = useApiClient();

  const [isGenerateDialogVisible, setIsGenerateDialogVisible] =
    useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const showGenerateDialog = () => {
    setError(null);
    setIsGenerateDialogVisible(true);
  };

  const hideGenerateDialog = () => {
    setError(null);
    setIsGenerateDialogVisible(false);
    setIsGenerating(false);
  };

  const generate = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateNote({ prompt });

      setIsGenerateDialogVisible(false);

      return result;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to generate note";

      setError(message);

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    error,
    isGenerateDialogVisible,
    isGenerating,
    generate,
    hideGenerateDialog,
    showGenerateDialog,
  };
};
