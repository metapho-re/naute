import { markdown as cmMarkdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { Compartment } from "@codemirror/state";
import { basicSetup, EditorView } from "codemirror";
import DOMPurify from "dompurify";
import { kanagawaLotus, kanagawaWave } from "kanagawa-codemirror-theme/src";
import { marked } from "marked";
import { type RefObject, useContext, useEffect, useRef, useState } from "react";

import { ThemeContext } from "../theme";

const themeCompartment = new Compartment();

interface Params {
  initialContent: string;
  onContentChange: () => void;
}

interface ReturnValue {
  content: string;
  editorRef: RefObject<HTMLDivElement | null>;
  renderPreview: () => string;
}

export const useNoteEditor = ({
  initialContent,
  onContentChange,
}: Params): ReturnValue => {
  const { theme } = useContext(ThemeContext);

  const [content, setContent] = useState<string>(initialContent);

  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const contentRef = useRef<string>(content);
  const onContentChangeRef = useRef<typeof onContentChange>(onContentChange);

  contentRef.current = content;
  onContentChangeRef.current = onContentChange;

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const view = new EditorView({
      doc: contentRef.current,
      extensions: [
        basicSetup,
        cmMarkdown({ codeLanguages: languages }),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();

            contentRef.current = newContent;
            setContent(newContent);
            onContentChangeRef.current();
          }
        }),
        themeCompartment.of(theme === "dark" ? kanagawaWave : kanagawaLotus),
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [theme]);

  useEffect(() => {
    if (!viewRef.current) {
      return;
    }

    viewRef.current.dispatch({
      effects: themeCompartment.reconfigure(
        theme === "dark" ? kanagawaWave : kanagawaLotus,
      ),
    });
  }, [theme]);

  useEffect(() => {
    setContent(initialContent);

    contentRef.current = initialContent;

    if (viewRef.current) {
      const view = viewRef.current;
      const currentDoc = view.state.doc.toString();

      if (currentDoc !== initialContent) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: initialContent,
          },
        });
      }
    }
  }, [initialContent]);

  const renderPreview = () => {
    try {
      const html = marked.parse(content);

      if (typeof html === "string") {
        return DOMPurify.sanitize(html);
      }

      return "";
    } catch {
      return "";
    }
  };

  return {
    content,
    editorRef,
    renderPreview,
  };
};
