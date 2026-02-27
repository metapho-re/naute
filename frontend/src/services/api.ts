import type {
  ApiResponse,
  CreateNoteRequest,
  Note,
  NoteSummary,
  UpdateNoteRequest,
} from "@naute/shared";

import { env } from "../env";

export interface ApiClient {
  createNote: (data: CreateNoteRequest) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string, signal?: AbortSignal) => Promise<Note>;
  listNotes: (signal?: AbortSignal) => Promise<NoteSummary[]>;
  updateNote: (id: string, data: UpdateNoteRequest) => Promise<Note>;
}

export const createApiClient = (
  getToken: () => Promise<string | null>,
): ApiClient => {
  const request = async <T>(path: string, options: RequestInit = {}) => {
    const token = await getToken();

    const response = await fetch(`${env.apiUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const json: ApiResponse<T> = await response.json();

    if (!response.ok || json.error) {
      throw new Error(json.error || `Request failed: ${response.status}`);
    }

    return json.data as T;
  };

  const createNote = (req: CreateNoteRequest) =>
    request<Note>("/notes", { method: "POST", body: JSON.stringify(req) });

  const deleteNote = (id: string) =>
    request<void>(`/notes/${id}`, { method: "DELETE" });

  const getNote = (id: string, signal?: AbortSignal) =>
    request<Note>(`/notes/${id}`, { signal });

  const listNotes = (signal?: AbortSignal) =>
    request<NoteSummary[]>("/notes", { signal });

  const updateNote = (id: string, req: UpdateNoteRequest) =>
    request<Note>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(req),
    });

  return {
    createNote,
    deleteNote,
    getNote,
    listNotes,
    updateNote,
  };
};
