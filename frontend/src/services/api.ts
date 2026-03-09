import type {
  ApiResponse,
  CreateNoteRequest,
  GenerateNoteRequest,
  GenerateNoteResponse,
  Note,
  NoteSummary,
  UpdateNoteRequest,
} from "@naute/shared";

import { env } from "../env";

export interface ApiClient {
  createNote: (data: CreateNoteRequest) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  generateNote: (data: GenerateNoteRequest) => Promise<GenerateNoteResponse>;
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
    request<Note>("/notes/create", {
      method: "POST",
      body: JSON.stringify(req),
    });

  const deleteNote = (id: string) =>
    request<void>(`/notes/${id}`, { method: "DELETE" });

  const generateNote = async (
    req: GenerateNoteRequest,
  ): Promise<GenerateNoteResponse> => {
    const token = await getToken();

    const response = await fetch(env.generateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer: string = "";
    let done: boolean = false;
    let value: Uint8Array<ArrayBuffer> | undefined;

    while (!done) {
      ({ done, value } = await reader.read());

      if (value) {
        buffer += decoder.decode(value, { stream: true });
      }
    }

    const match = buffer.match(/^data: (.+)$/m);

    if (!match) {
      throw new Error("No data received from generate endpoint");
    }

    let apiResponse: ApiResponse<GenerateNoteResponse>;

    try {
      apiResponse = JSON.parse(match[1]) as ApiResponse<GenerateNoteResponse>;
    } catch {
      throw new Error("Invalid response from generate endpoint");
    }

    if (apiResponse.error) {
      throw new Error(apiResponse.error);
    }

    return apiResponse.data as GenerateNoteResponse;
  };

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
    generateNote,
    getNote,
    listNotes,
    updateNote,
  };
};
