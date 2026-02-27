import { cn } from "../utils";

import { useNoteViewPage } from "./use-note-view-page";

export const NoteViewPage = () => {
  const {
    isLoading,
    note,
    handleNavigateEdit,
    handleNavigateHome,
    renderMarkdown,
  } = useNoteViewPage();

  return (
    <div className="bg-base relative flex flex-1 flex-col overflow-hidden">
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 z-10",
            "flex items-center justify-center",
            "bg-base",
          )}
        >
          <div
            className={cn(
              "size-8 animate-spin rounded-full",
              "border-4 border-accent border-t-transparent",
            )}
          />
        </div>
      )}
      <div className="border-edge flex items-center gap-4 border-b px-8 py-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <h1 className="text-ink text-2xl font-bold">{note?.title}</h1>
          {note?.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-3 py-1 text-sm",
                "font-medium bg-tag text-tag-fg",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleNavigateHome}
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
            onClick={handleNavigateEdit}
            className={cn(
              "flex size-9 items-center justify-center",
              "rounded-lg transition-colors",
              "bg-accent/15 text-accent hover:bg-accent/25",
            )}
            title="Edit"
          >
            <span className="material-icons-outlined text-xl">edit</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div
          className="markdown-preview mx-auto max-w-5xl"
          dangerouslySetInnerHTML={{ __html: renderMarkdown() }}
        />
      </div>
    </div>
  );
};
