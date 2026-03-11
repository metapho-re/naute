export type AiNoteAction = "format" | "generate";

export interface AiNoteRequest {
  action: AiNoteAction;
  payload: string;
}

export interface AiNoteResponse {
  title: string;
  content: string;
  tags: string[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
}
