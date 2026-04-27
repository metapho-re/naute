import { type ChangeEvent, type SubmitEvent, useState } from "react";

import { cn } from "../utils";

interface Props {
  description: string;
  error: string | null;
  isProcessing: boolean;
  label: string;
  placeholder: string;
  processingLabel: string;
  rows: number;
  title: string;
  onCancel: () => void;
  onSubmit: (payload: string) => void;
}

export const AiNoteDialog = ({
  description,
  error,
  isProcessing,
  label,
  placeholder,
  processingLabel,
  rows,
  title,
  onCancel,
  onSubmit,
}: Props) => {
  const [input, setInput] = useState<string>("");

  const trimmedInput = input.trim();
  const isSubmitDisabled = trimmedInput.length === 0 || isProcessing;

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    if (!isSubmitDisabled) {
      onSubmit(trimmedInput);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
      )}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          "mx-4 w-full max-w-lg rounded-xl border p-5 md:p-8",
          "border-edge bg-float shadow-floating",
        )}
      >
        <h3 className="text-ink mb-3 text-xl font-semibold">{title}</h3>
        <p className="text-ink-dim mb-5 text-base">{description}</p>
        <textarea
          autoFocus
          disabled={isProcessing}
          placeholder={placeholder}
          rows={rows}
          value={input}
          onChange={handleInputChange}
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
            disabled={isProcessing}
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
            {isProcessing ? processingLabel : label}
          </button>
        </div>
      </form>
    </div>
  );
};
