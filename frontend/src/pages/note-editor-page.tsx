import { NoteWorkspace } from "../components";

import { useNoteEditorPage } from "./use-note-editor-page";

export const NoteEditorPage = () => {
  const {
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
  } = useNoteEditorPage();

  return (
    <NoteWorkspace
      editorRef={editorRef}
      isDeleteConfirmVisible={isDeleteConfirmVisible}
      isDeleting={isDeleting}
      isEditMode={isEditMode}
      isLoading={isLoading}
      isSaving={isSaving}
      tagInput={tagInput}
      tags={tags}
      title={title}
      onDelete={handleDelete}
      onDeletionConfirmChange={handleDeleteConfirmChange}
      onNavigateHome={handleNavigateHome}
      onSave={handleSave}
      onTagAdd={handleTagAdd}
      onTagInputChange={handleTagInputChange}
      onTagRemove={handleTagRemove}
      onTitleChange={handleTitleChange}
      renderPreview={renderPreview}
    />
  );
};
