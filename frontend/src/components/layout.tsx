import { type PropsWithChildren, useState } from "react";

import type { SortField, SortOrder, Tag } from "../types";
import { cn } from "../utils";

import { Sidebar } from "./sidebar";

interface Props {
  noteCount: number;
  order: SortOrder;
  searchQuery: string;
  selectedTagNames: string[];
  sort: SortField;
  tags: Tag[];
  onFormatClick: () => void;
  onGenerateClick: () => void;
  onOrderChange: (order: SortOrder) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortField) => void;
  onTagSelect: (tags: string[]) => void;
}

export const Layout = ({
  children,
  noteCount,
  order,
  searchQuery,
  selectedTagNames,
  sort,
  tags,
  onFormatClick,
  onGenerateClick,
  onOrderChange,
  onSearchChange,
  onSortChange,
  onTagSelect,
}: PropsWithChildren<Props>) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((previousState) => !previousState);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="bg-base flex flex-1 flex-col overflow-hidden md:flex-row">
      <div
        className={cn(
          "border-edge bg-surface overflow-y-auto border-b md:w-1/3 md:border-b-0 md:border-r",
          isSidebarOpen ? "block" : "hidden md:block",
        )}
      >
        <div className="flex items-center justify-between px-5 pt-4 md:hidden">
          <span className="text-ink text-sm font-semibold">Filters</span>
          <button
            onClick={handleSidebarClose}
            className={cn(
              "flex size-9 items-center justify-center",
              "rounded-lg transition-colors",
              "bg-accent/15 text-accent hover:bg-accent/25",
            )}
            title="Back to notes"
          >
            <span className="material-icons-outlined text-xl">close</span>
          </button>
        </div>
        <Sidebar
          noteCount={noteCount}
          order={order}
          searchQuery={searchQuery}
          selectedTagNames={selectedTagNames}
          sort={sort}
          tags={tags}
          onFormatClick={onFormatClick}
          onGenerateClick={onGenerateClick}
          onOrderChange={onOrderChange}
          onSearchChange={onSearchChange}
          onSortChange={onSortChange}
          onTagSelect={onTagSelect}
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-edge flex items-center border-b px-4 py-2.5 md:hidden">
          <button
            onClick={handleSidebarToggle}
            className={cn(
              "flex size-9 items-center justify-center",
              "rounded-lg transition-colors",
              "bg-accent/15 text-accent hover:bg-accent/25",
            )}
            title="Show filters"
          >
            <span className="material-icons-outlined text-xl">tune</span>
          </button>
          {selectedTagNames.length > 0 && (
            <span className="text-accent ml-2 text-sm font-medium">
              {selectedTagNames.length} tag
              {selectedTagNames.length > 1 ? "s" : ""} selected
            </span>
          )}
          {searchQuery && (
            <span className="text-ink-muted ml-2 truncate text-sm">
              &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
        <main
          className="flex-1 overflow-auto p-4 md:p-8"
          onClick={isSidebarOpen ? handleSidebarClose : undefined}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
