import type { NoteSummary } from "@naute/shared";
import { useMemo, useState } from "react";

import { useNotes } from "../hooks";
import type { SortField, SortOrder, Tag } from "../types";

interface ReturnValue {
  error: string | null;
  filteredNotes: NoteSummary[];
  hasFilters: boolean;
  isLoading: boolean;
  notes: NoteSummary[];
  order: SortOrder;
  searchQuery: string;
  selectedTagNames: string[];
  sort: SortField;
  tags: Tag[];
  handleOrderChange: (value: SortOrder) => void;
  handleSearchQueryChange: (value: string) => void;
  handleSelectedTagNamesChange: (values: string[]) => void;
  handleSortChange: (value: SortField) => void;
}

export const useNoteListPage = (): ReturnValue => {
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sort, setSort] = useState<SortField>("createdAt");
  const [order, setOrder] = useState<SortOrder>("desc");

  const { notes, isLoading, error } = useNotes();

  const tags = useMemo<Tag[]>(() => {
    const tagCounts = new Map<string, number>();

    for (const note of notes) {
      for (const tag of note.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .map(([tagName, noteCount]) => ({ tagName, noteCount }))
      .sort((a, b) => a.tagName.localeCompare(b.tagName));
  }, [notes]);

  const filteredNotes = useMemo<NoteSummary[]>(() => {
    let result = [...notes];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (selectedTagNames.length > 0) {
      result = result.filter((note) =>
        selectedTagNames.every((tag) => note.tags.includes(tag)),
      );
    }

    result.sort((a, b) => {
      let comparison: number;

      if (sort === "title") {
        comparison = a.title.localeCompare(b.title);
      } else {
        comparison = new Date(a[sort]).getTime() - new Date(b[sort]).getTime();
      }

      return order === "asc" ? comparison : -comparison;
    });

    return result;
  }, [notes, searchQuery, selectedTagNames, sort, order]);

  const hasFilters = searchQuery.length > 0 || selectedTagNames.length > 0;

  const handleOrderChange = (value: SortOrder) => {
    setOrder(value);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSelectedTagNamesChange = (values: string[]) => {
    setSelectedTagNames(values);
  };

  const handleSortChange = (value: SortField) => {
    setSort(value);
  };

  return {
    error,
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
  };
};
