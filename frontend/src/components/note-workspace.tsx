import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

import { cn } from "../utils";

import { NoteEditor } from "./note-editor";

const TITLE_MAX_LENGTH = 200;

interface Props {
  editorRef: RefObject<HTMLDivElement | null>;
  isDeleting: boolean;
  isDeleteConfirmVisible: boolean;
  isEditMode: boolean;
  isLoading: boolean;
  isSaving: boolean;
  tagInput: string;
  tags: string[];
  title: string;
  onDelete: () => Promise<void>;
  onDeletionConfirmChange: (visible: boolean) => void;
  onNavigateHome: () => void;
  onSave: () => Promise<void>;
  onTagAdd: () => void;
  onTagInputChange: (value: string) => void;
  onTagRemove: (tag: string) => void;
  onTitleChange: (value: string) => void;
  renderPreview: () => string;
}

export const NoteWorkspace = ({
  editorRef,
  isDeleting,
  isDeleteConfirmVisible,
  isEditMode,
  isLoading,
  isSaving,
  tagInput,
  tags,
  title,
  onDelete,
  onDeletionConfirmChange,
  onNavigateHome,
  onSave,
  onTagAdd,
  onTagInputChange,
  onTagRemove,
  onTitleChange,
  renderPreview,
}: Props) => {
  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value);
  };

  const handleTagRemoveFactory = (tag: string) => () => {
    onTagRemove(tag);
  };

  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onTagInputChange(event.target.value);
  };

  const handleTagAdd = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      onTagAdd();
    }
  };

  const handleDeletionConfirmFactory = (value: boolean) => () => {
    onDeletionConfirmChange(value);
  };

  return (
    <div className="bg-base relative flex flex-1 flex-col overflow-hidden">
      {isEditMode && isLoading && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center",
            "bg-base",
          )}
        >
          <div
            className={cn(
              "size-8 animate-spin rounded-full border-4",
              "border-accent border-t-transparent",
            )}
          />
        </div>
      )}
      <div
        className={cn(
          "flex items-center gap-4 border-b px-8 py-4",
          "border-edge",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note title"
            maxLength={TITLE_MAX_LENGTH}
            className={cn(
              "min-w-0 shrink-0 border-0 bg-transparent",
              "text-2xl font-bold focus:outline-none",
              "text-ink placeholder:text-ink-faint",
            )}
          />
          {tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "flex items-center gap-1",
                "rounded-full px-3 py-1 text-sm font-medium",
                "bg-tag text-tag-fg",
              )}
            >
              {tag}
              <button
                onClick={handleTagRemoveFactory(tag)}
                className="text-tag-fg/50 hover:text-tag-fg transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagAdd}
            placeholder="Add tag..."
            className={cn(
              "w-24 border-0 bg-transparent text-base focus:outline-none",
              "text-ink-muted placeholder:text-ink-faint",
            )}
          />
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={onNavigateHome}
            className={cn(
              "flex size-9 items-center justify-center",
              "rounded-lg transition-colors",
              "bg-accent/15 text-accent hover:bg-accent/25",
            )}
            title="Home"
          >
            <span className="material-icons-outlined text-xl">home</span>
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !title.trim()}
            className={cn(
              "flex size-9 items-center justify-center",
              "rounded-lg transition-colors",
              "bg-accent/15 text-accent hover:bg-accent/25",
              "disabled:opacity-50",
            )}
            title="Save"
          >
            <span className="material-icons-outlined text-xl">save</span>
          </button>
          {isEditMode && (
            <button
              onClick={handleDeletionConfirmFactory(true)}
              disabled={isDeleting}
              className={cn(
                "flex size-9 items-center justify-center",
                "rounded-lg transition-colors",
                "bg-danger/15 text-danger hover:bg-danger/25",
                "disabled:opacity-50",
              )}
              title="Delete"
            >
              <span className="material-icons-outlined text-xl">delete</span>
            </button>
          )}
        </div>
      </div>
      <NoteEditor editorRef={editorRef} renderPreview={renderPreview} />
      {isDeleteConfirmVisible && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
          )}
        >
          <div
            className={cn(
              "mx-4 min-w-96 rounded-xl border p-8",
              "border-edge bg-float shadow-floating",
            )}
          >
            <h3 className="text-ink mb-3 text-xl font-semibold">
              Delete note?
            </h3>
            <p className="text-ink-muted mb-5 text-base">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeletionConfirmFactory(false)}
                className={cn(
                  "rounded-lg border px-5 py-2.5 text-base transition-colors",
                  "border-edge text-ink-dim hover:bg-highlight",
                )}
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className={cn(
                  "rounded-lg px-5 py-2.5 text-base",
                  "font-medium transition-colors",
                  "bg-danger text-danger-fg hover:bg-danger-hover",
                )}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
