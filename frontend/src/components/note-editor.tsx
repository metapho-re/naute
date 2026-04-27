import { type RefObject, useState } from "react";

import { cn } from "../utils";

type Tab = "editor" | "preview";

interface Props {
  editorRef: RefObject<HTMLDivElement | null>;
  previewHtml: string;
}

export const NoteEditor = ({ editorRef, previewHtml }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("editor");

  const handleTabChangeFactory = (tab: Tab) => () => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-edge flex border-b xl:hidden">
        <button
          onClick={handleTabChangeFactory("editor")}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "editor"
              ? "border-accent text-accent border-b-2"
              : "text-ink-muted",
          )}
        >
          Editor
        </button>
        <button
          onClick={handleTabChangeFactory("preview")}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "preview"
              ? "border-accent text-accent border-b-2"
              : "text-ink-muted",
          )}
        >
          Preview
        </button>
      </div>
      <div className="editor-fill flex min-h-0 flex-1 gap-0 p-3 xl:p-8">
        <div
          ref={editorRef}
          className={cn(
            "min-h-0 flex-1 overflow-hidden",
            "rounded-xl border xl:rounded-l-xl xl:rounded-r-none border-edge",
            activeTab === "editor" ? "block" : "hidden xl:block",
          )}
        />
        <div
          className={cn(
            "markdown-preview min-h-0 flex-1",
            "overflow-y-auto rounded-xl xl:rounded-l-none xl:rounded-r-xl",
            "border p-4 xl:border-l-0 xl:p-6",
            "border-edge bg-panel",
            activeTab === "preview" ? "block" : "hidden xl:block",
          )}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  );
};
