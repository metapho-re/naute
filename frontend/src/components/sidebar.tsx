import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";

import type { Tag, SortField, SortOrder } from "../types";
import { cn } from "../utils";

import { Dropdown } from "./dropdown";

interface Props {
  noteCount: number;
  order: SortOrder;
  searchQuery: string;
  selectedTagNames: string[];
  sort: SortField;
  tags: Tag[];
  onOrderChange: (order: SortOrder) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortField) => void;
  onTagSelect: (tags: string[]) => void;
}

export const Sidebar = ({
  noteCount,
  order,
  searchQuery,
  selectedTagNames,
  sort,
  tags,
  onOrderChange,
  onSearchChange,
  onSortChange,
  onTagSelect,
}: Props) => {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleTagsClear = () => {
    onTagSelect([]);
  };

  const handleTagSelectFactory = (tag: Tag, isSelected: boolean) => () => {
    onTagSelect(
      isSelected
        ? selectedTagNames.filter(
            (selectedTagName) => selectedTagName !== tag.tagName,
          )
        : [...selectedTagNames, tag.tagName],
    );
  };

  return (
    <div className="flex h-full flex-col p-5">
      <Link
        to="/notes/new"
        className={cn(
          "mb-5 block rounded-lg px-4 py-2.5 text-center text-base font-medium",
          "bg-accent text-accent-fg shadow-soft",
          "hover:bg-accent-hover transition-colors",
        )}
      >
        + New Note
      </Link>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={handleSearchChange}
        className={cn(
          "mb-5 w-full rounded-lg border",
          "px-3.5 py-2.5 text-base transition-colors",
          "border-edge bg-panel text-ink placeholder:text-ink-faint",
          "focus:border-accent focus:outline-none",
        )}
      />
      <Dropdown
        order={order}
        sort={sort}
        onOrderChange={onOrderChange}
        onSortChange={onSortChange}
      />
      <div className="flex-1 overflow-auto">
        <h2
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-wider",
            "text-ink-muted",
          )}
        >
          Tags
        </h2>
        <ul className="flex flex-wrap gap-3">
          <li className="inline-flex">
            <button
              onClick={handleTagsClear}
              className={cn(
                "rounded-full border px-3.5 py-2 text-base transition-colors",
                selectedTagNames.length === 0
                  ? "border-active bg-active text-active-fg font-medium"
                  : "border-edge text-ink-dim hover:bg-highlight",
              )}
            >
              All Notes
              <span
                className={cn(
                  "ml-1.5 text-sm",
                  selectedTagNames.length === 0
                    ? "text-active-fg"
                    : "text-ink-faint",
                )}
              >
                ({noteCount})
              </span>
            </button>
          </li>
          {tags.map((tag) => {
            const isSelected = selectedTagNames.includes(tag.tagName);

            return (
              <li key={tag.tagName} className="inline-flex">
                <button
                  onClick={handleTagSelectFactory(tag, isSelected)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-base transition-colors",
                    isSelected
                      ? "border-active bg-active text-active-fg font-medium"
                      : "border-edge text-ink-dim hover:bg-highlight",
                  )}
                >
                  {tag.tagName}
                  <span
                    className={cn(
                      "ml-1.5 text-sm",
                      isSelected ? "text-active-fg" : "text-ink-faint",
                    )}
                  >
                    ({tag.noteCount})
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
