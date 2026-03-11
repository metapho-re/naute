import type { NoteSummary } from "@naute/shared";
import { Link } from "react-router-dom";

import { cn, getRelativeTimeString } from "../utils";

interface Props {
  note: NoteSummary;
}

export const NoteCard = ({ note }: Props) => (
  <Link
    to={`/notes/${note.id}`}
    className={cn(
      "group block rounded-xl border px-5 py-2.5 transition-all",
      "border-edge bg-panel shadow-soft hover:shadow-elevated",
    )}
  >
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="text-ink text-xl font-semibold">{note.title}</h3>
        {note.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-sm font-medium",
                  "bg-tag text-tag-fg",
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="text-ink-faint text-sm">
        {getRelativeTimeString(note.updatedAt)}
      </span>
      <Link
        to={`/notes/${note.id}/edit`}
        className={cn(
          "flex size-9 items-center justify-center",
          "rounded-lg transition-all",
          "bg-accent/15 text-accent hover:bg-accent/25",
          "opacity-0 group-hover:opacity-100",
        )}
        title="Edit"
      >
        <span className="material-icons-outlined text-xl">edit</span>
      </Link>
    </div>
  </Link>
);
