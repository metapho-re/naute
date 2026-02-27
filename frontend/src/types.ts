export interface Tag {
  tagName: string;
  noteCount: number;
}

export type SortField = "createdAt" | "updatedAt" | "title";

export type SortOrder = "asc" | "desc";
