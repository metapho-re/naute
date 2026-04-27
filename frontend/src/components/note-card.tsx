import type { NoteSummary } from "@naute/shared";
import type { KeyboardEvent, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { cn, getRelativeTimeString } from "../utils";

interface Props {
  note: NoteSummary;
}

export const NoteCard = ({ note }: Props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/notes/${note.id}`);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      navigate(`/notes/${note.id}`);
    }
  };

  const handleStopEventPropagation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group block cursor-pointer rounded-xl border px-5 py-2.5 transition-all",
        "border-edge bg-panel shadow-soft hover:shadow-elevated",
      )}
    >
      <div className="flex flex-col gap-2">
        <h3
          className={cn(
            "text-ink text-[clamp(1rem,0.5rem+2vw,1.25rem)]",
            "font-semibold leading-tight",
          )}
        >
          {note.title}
        </h3>
        <div className="flex items-center gap-2">
          {note.tags.length > 0 && (
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
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
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="text-ink-faint text-sm">
              {getRelativeTimeString(note.createdAt)}
            </span>
            <Link
              to={`/notes/${note.id}/edit`}
              onClick={handleStopEventPropagation}
              className={cn(
                "flex size-9 items-center justify-center",
                "rounded-lg transition-all",
                "bg-accent/15 text-accent hover:bg-accent/25",
                "md:opacity-0 md:group-hover:opacity-100",
              )}
              title="Edit"
            >
              <span className="material-icons-outlined text-xl">edit</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
