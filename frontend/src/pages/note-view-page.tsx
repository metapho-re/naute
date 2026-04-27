import { cn } from "../utils";

import { useNoteViewPage } from "./use-note-view-page";

export const NoteViewPage = () => {
  const {
    isLoading,
    markdownHtml,
    note,
    handleNavigateEdit,
    handleNavigateHome,
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
      <div className="border-edge flex flex-col gap-2 border-b p-4 md:px-8">
        <h1
          className={cn(
            "text-ink truncate font-bold",
            "text-[clamp(1.5rem,1rem+2vw,2rem)]",
          )}
        >
          {note?.title}
        </h1>
        <div className="flex items-center gap-3">
          {note?.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
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
          )}
          <div className="ml-auto flex shrink-0 gap-3">
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
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:px-8 md:py-6">
        <div
          className="markdown-preview mx-auto max-w-5xl"
          dangerouslySetInnerHTML={{ __html: markdownHtml }}
        />
      </div>
    </div>
  );
};
