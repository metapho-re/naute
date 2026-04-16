import type { Note } from "@naute/shared";
import { useNavigate, useParams } from "react-router-dom";

import { useMarkdown, useNote } from "../hooks";

interface ReturnValue {
  id: string | undefined;
  isLoading: boolean;
  markdownHtml: string;
  note: Note | null;
  handleNavigateEdit: () => void;
  handleNavigateHome: () => void;
}

export const useNoteViewPage = (): ReturnValue => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isLoading, note } = useNote(id);
  const markdownHtml = useMarkdown(note?.content ?? "");

  const handleNavigateEdit = () => {
    navigate(`/notes/${id}/edit`);
  };

  const handleNavigateHome = () => {
    navigate("/notes");
  };

  return {
    id,
    isLoading,
    markdownHtml,
    note,
    handleNavigateEdit,
    handleNavigateHome,
  };
};
