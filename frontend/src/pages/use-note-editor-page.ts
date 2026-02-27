import { type RefObject, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useDeleteNote, useNote, useNoteEditor, useSaveNote } from "../hooks";

interface ReturnValue {
  editorRef: RefObject<HTMLDivElement | null>;
  isDeleteConfirmVisible: boolean;
  isDeleting: boolean;
  isEditMode: boolean;
  isLoading: boolean;
  isSaving: boolean;
  tagInput: string;
  tags: string[];
  title: string;
  handleDelete: () => Promise<void>;
  handleDeleteConfirmChange: (isVisible: boolean) => void;
  handleNavigateHome: () => void;
  handleSave: () => Promise<void>;
  handleTagAdd: () => void;
  handleTagInputChange: (value: string) => void;
  handleTagRemove: (tag: string) => void;
  handleTitleChange: (value: string) => void;
  renderPreview: () => string;
}

export const useNoteEditorPage = (): ReturnValue => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { note, isLoading } = useNote(id);
  const { save, isSaving } = useSaveNote();
  const { remove, isDeleting } = useDeleteNote();

  const [title, setTitle] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] =
    useState<boolean>(false);
  const [initialContent, setInitialContent] = useState<string>("");

  const handleContentChange = useCallback(() => {
    setHasChanges(true);
  }, []);

  const { content, editorRef, renderPreview } = useNoteEditor({
    initialContent,
    onContentChange: handleContentChange,
  });

  const isEditMode = !!id;

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setTags(note.tags);
      setInitialContent(note.content);
      setHasChanges(false);
    }
  }, [note]);

  useEffect(() => {
    if (!hasChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  const handleDelete = async () => {
    if (!id) {
      return;
    }

    try {
      await remove(id);

      navigate("/notes", { replace: true });
    } catch {
      void 0;
    }
  };

  const handleDeleteConfirmChange = (isVisible: boolean) => {
    setIsDeleteConfirmVisible(isVisible);
  };

  const handleNavigateHome = () => {
    navigate("/notes");
  };

  const handleSave = async () => {
    try {
      const data = await save(id, { title, content, tags });

      setHasChanges(false);

      navigate(`/notes/${data.id}/edit`, { replace: true });
    } catch {
      void 0;
    }
  };

  const handleTagAdd = () => {
    const tag = tagInput.trim().toLowerCase();

    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setHasChanges(true);
    }

    setTagInput("");
  };

  const handleTagInputChange = (value: string) => {
    setTagInput(value);
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setHasChanges(true);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(true);
  };

  return {
    editorRef,
    isDeleteConfirmVisible,
    isDeleting,
    isEditMode,
    isLoading,
    isSaving,
    tagInput,
    tags,
    title,
    handleDelete,
    handleDeleteConfirmChange,
    handleNavigateHome,
    handleSave,
    handleTagAdd,
    handleTagInputChange,
    handleTagRemove,
    handleTitleChange,
    renderPreview,
  };
};
