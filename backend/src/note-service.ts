import type {
  CreateNoteRequest,
  Note,
  NoteSummary,
  UpdateNoteRequest,
} from "@naute/shared";
import { v4 } from "uuid";

import { getAllNotes, getNote, putNote, removeNote } from "./database";
import {
  NotFoundError,
  validateContent,
  validateTags,
  validateTitle,
} from "./errors";

export const createNote = async (req: CreateNoteRequest): Promise<Note> => {
  validateTitle(req.title);
  validateContent(req.content);
  validateTags(req.tags);

  const now = new Date().toISOString();
  const id = v4();

  const note: Note = {
    id,
    title: req.title,
    content: req.content,
    tags: req.tags,
    createdAt: now,
    updatedAt: now,
  };

  await putNote(note);

  return note;
};

export const updateNote = async (
  id: string,
  req: UpdateNoteRequest,
): Promise<Note> => {
  const note = await getNote(id);

  if (!note) {
    throw new NotFoundError("Note not found");
  }

  if (req.title !== undefined) {
    validateTitle(req.title);
  }

  if (req.content !== undefined) {
    validateContent(req.content);
  }

  if (req.tags !== undefined) {
    validateTags(req.tags);
  }

  const now = new Date().toISOString();

  const updatedNote: Note = {
    id,
    title: req.title ?? note.title,
    content: req.content ?? note.content,
    tags: req.tags ?? note.tags,
    createdAt: note.createdAt,
    updatedAt: now,
  };

  await putNote(updatedNote);

  return updatedNote;
};

export const deleteNote = async (id: string): Promise<void> => {
  const note = await getNote(id);

  if (!note) {
    throw new NotFoundError("Note not found");
  }

  await removeNote(id);
};

export const findNote = async (id: string): Promise<Note> => {
  const note = await getNote(id);

  if (!note) {
    throw new NotFoundError("Note not found");
  }

  return note;
};

export const listNotes = async (): Promise<NoteSummary[]> =>
  await getAllNotes();
