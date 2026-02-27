import type { Note } from "@naute/shared";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useNote } from "../hooks";

interface ReturnValue {
  id: string | undefined;
  isLoading: boolean;
  note: Note | null;
  handleNavigateEdit: () => void;
  handleNavigateHome: () => void;
  renderMarkdown: () => string;
}

export const useNoteViewPage = (): ReturnValue => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isLoading, note } = useNote(id);

  const handleNavigateEdit = () => {
    navigate(`/notes/${id}/edit`);
  };

  const handleNavigateHome = () => {
    navigate("/notes");
  };

  const renderMarkdown = useCallback(() => {
    if (!note?.content) {
      return "";
    }

    try {
      const html = marked.parse(note.content);

      if (typeof html === "string") {
        return DOMPurify.sanitize(html);
      }

      return "";
    } catch {
      return "";
    }
  }, [note?.content]);

  return {
    id,
    isLoading,
    note,
    handleNavigateEdit,
    handleNavigateHome,
    renderMarkdown,
  };
};
