import { type ChangeEvent, type SubmitEvent, useState } from "react";

import { cn } from "../utils";

interface Props {
  error: string | null;
  isGenerating: boolean;
  onCancel: () => void;
  onGenerate: (prompt: string) => void;
}

export const GenerateNoteDialog = ({
  error,
  isGenerating,
  onCancel,
  onGenerate,
}: Props) => {
  const [prompt, setPrompt] = useState<string>("");

  const trimmedPrompt = prompt.trim();

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    if (trimmedPrompt.length > 0 && !isGenerating) {
      onGenerate(trimmedPrompt);
    }
  };

  const isSubmitDisabled = trimmedPrompt.length === 0 || isGenerating;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
      )}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          "mx-4 w-full max-w-lg rounded-xl border p-8",
          "border-edge bg-float shadow-floating",
        )}
      >
        <h3 className="text-ink mb-3 text-xl font-semibold">
          Generate with AI
        </h3>
        <p className="text-ink-dim mb-5 text-base">
          Describe the note you want to create. AI will generate a title,
          content, and tags for you to review.
        </p>
        <textarea
          autoFocus
          disabled={isGenerating}
          placeholder="e.g. A guide to React hooks with examples..."
          rows={4}
          value={prompt}
          onChange={handlePromptChange}
          className={cn(
            "mb-5 w-full resize-none rounded-lg border",
            "px-3.5 py-2.5 text-base transition-colors",
            "border-edge bg-panel text-ink placeholder:text-ink-faint",
            "focus:border-accent focus:outline-none",
            "disabled:opacity-50",
          )}
        />
        {error && (
          <div
            className={cn(
              "mb-5 rounded-lg p-3 text-sm",
              "bg-danger-dim text-danger",
            )}
          >
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={isGenerating}
            onClick={onCancel}
            className={cn(
              "rounded-lg border px-5 py-2.5 text-base font-medium transition-colors",
              "border-edge text-ink-dim hover:bg-highlight",
              "disabled:opacity-50",
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={cn(
              "rounded-lg px-5 py-2.5 text-base font-medium transition-colors",
              "bg-accent text-accent-fg shadow-soft hover:bg-accent-hover",
              "disabled:opacity-50",
            )}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
};
