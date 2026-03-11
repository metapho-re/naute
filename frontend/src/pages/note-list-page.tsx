import { Link, useNavigate } from "react-router-dom";

import { AiNoteDialog, Layout, NoteCard } from "../components";
import { useAiNote } from "../hooks";
import { cn } from "../utils";

import { useNoteListPage } from "./use-note-list-page";

const SKELETON_COUNT = 3;

export const NoteListPage = () => {
  const navigate = useNavigate();

  const {
    error: listError,
    filteredNotes,
    hasFilters,
    isLoading,
    notes,
    order,
    searchQuery,
    selectedTagNames,
    sort,
    tags,
    handleOrderChange,
    handleSearchQueryChange,
    handleSelectedTagNamesChange,
    handleSortChange,
  } = useNoteListPage();

  const {
    error: formatError,
    isDialogVisible: isFormatDialogVisible,
    isProcessing: isFormatting,
    hideDialog: hideFormatDialog,
    process: formatNote,
    showDialog: showFormatDialog,
  } = useAiNote("format");

  const {
    error: generateError,
    isDialogVisible: isGenerateDialogVisible,
    isProcessing: isGenerating,
    hideDialog: hideGenerateDialog,
    process: generateNote,
    showDialog: showGenerateDialog,
  } = useAiNote("generate");

  const handleAiAction = async (
    payload: string,
    process: typeof formatNote,
  ) => {
    const result = await process(payload);

    if (result) {
      navigate("/notes/new", {
        state: {
          title: result.title,
          content: result.content,
          tags: result.tags,
        },
      });
    }
  };

  return (
    <Layout
      noteCount={notes.length}
      order={order}
      searchQuery={searchQuery}
      selectedTagNames={selectedTagNames}
      sort={sort}
      tags={tags}
      onFormatClick={showFormatDialog}
      onGenerateClick={showGenerateDialog}
      onOrderChange={handleOrderChange}
      onSearchChange={handleSearchQueryChange}
      onSortChange={handleSortChange}
      onTagSelect={handleSelectedTagNamesChange}
    >
      {listError && (
        <div
          className={cn(
            "mb-5 rounded-xl p-4 text-base",
            "bg-danger-dim text-danger",
          )}
        >
          {listError}
        </div>
      )}
      {isLoading && notes.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div
              key={index}
              className={cn(
                "animate-pulse rounded-xl border p-5",
                "border-edge bg-panel",
              )}
            >
              <div className="bg-highlight mb-3 h-6 w-1/3 rounded" />
              <div className="bg-highlight mb-2 h-4 w-full rounded" />
              <div className="bg-highlight h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center py-20 text-center",
          )}
        >
          <svg
            className="text-ink-faint mb-4 size-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-ink-dim mb-3 text-2xl font-semibold">
            {hasFilters ? "No matching notes" : "No notes yet"}
          </h2>
          <p className="text-ink-muted mb-5 text-base">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Create your first note to get started"}
          </p>
          {!hasFilters && (
            <Link
              to="/notes/new"
              className={cn(
                "rounded-lg px-5 py-2.5 text-base font-medium transition-colors",
                "bg-accent text-accent-fg shadow-soft hover:bg-accent-hover",
              )}
            >
              Create your first note
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
      {isFormatDialogVisible && (
        <AiNoteDialog
          description="Paste your raw note text. AI will structure it into well-formatted markdown with a title, content, and tags for you to review."
          error={formatError}
          isProcessing={isFormatting}
          label="Format"
          placeholder="Paste your raw, unstructured note text here..."
          processingLabel="Formatting..."
          rows={6}
          title="Format with AI"
          onCancel={hideFormatDialog}
          onSubmit={(payload) => handleAiAction(payload, formatNote)}
        />
      )}
      {isGenerateDialogVisible && (
        <AiNoteDialog
          description="Describe the note you want to create. AI will generate a title, content, and tags for you to review."
          error={generateError}
          isProcessing={isGenerating}
          label="Generate"
          placeholder="e.g. A guide to React hooks with examples..."
          processingLabel="Generating..."
          rows={4}
          title="Generate with AI"
          onCancel={hideGenerateDialog}
          onSubmit={(payload) => handleAiAction(payload, generateNote)}
        />
      )}
    </Layout>
  );
};
