import { LanguageFn } from "highlight.js";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import haskell from "highlight.js/lib/languages/haskell";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import type { RefObject } from "react";

import { cn } from "../utils";

const SUPPORTED_LANGUAGES: [string, LanguageFn][] = [
  ["bash", bash],
  ["csharp", csharp],
  ["css", css],
  ["haskell", haskell],
  ["javascript", javascript],
  ["json", json],
  ["python", python],
  ["rust", rust],
  ["sql", sql],
  ["typescript", typescript],
  ["xml", xml],
  ["yaml", yaml],
];

for (const [name, language] of SUPPORTED_LANGUAGES) {
  hljs.registerLanguage(name, language);
}

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, language) {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }

      return code;
    },
  }),
);

interface Props {
  editorRef: RefObject<HTMLDivElement | null>;
  renderPreview: () => string;
}

export const NoteEditor = ({ editorRef, renderPreview }: Props) => (
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
      dangerouslySetInnerHTML={{ __html: renderPreview() }}
    />
  </div>
);
