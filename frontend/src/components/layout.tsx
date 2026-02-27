import type { PropsWithChildren } from "react";

import type { SortField, SortOrder, Tag } from "../types";

import { Sidebar } from "./sidebar";

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

export const Layout = ({
  children,
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
}: PropsWithChildren<Props>) => (
  <div className="bg-base flex flex-1 overflow-hidden">
    <div className="border-edge bg-surface w-1/3 border-r">
      <Sidebar
        noteCount={noteCount}
        order={order}
        searchQuery={searchQuery}
        selectedTagNames={selectedTagNames}
        sort={sort}
        tags={tags}
        onOrderChange={onOrderChange}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
        onTagSelect={onTagSelect}
      />
    </div>
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  </div>
);
