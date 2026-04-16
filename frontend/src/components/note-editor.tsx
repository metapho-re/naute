import type { RefObject } from "react";

import { cn } from "../utils";

interface Props {
  editorRef: RefObject<HTMLDivElement | null>;
  previewHtml: string;
}

export const NoteEditor = ({ editorRef, previewHtml }: Props) => (
  <div className="editor-fill flex min-h-0 flex-1 gap-0 p-8">
    <div
      ref={editorRef}
      className={cn(
        "min-h-0 flex-1 overflow-hidden",
        "rounded-l-xl border border-edge",
      )}
    />
    <div
      className={cn(
        "markdown-preview min-h-0 flex-1",
        "overflow-y-auto rounded-r-xl",
        "border border-l-0 p-6",
        "border-edge bg-panel",
      )}
      dangerouslySetInnerHTML={{ __html: previewHtml }}
    />
  </div>
);
