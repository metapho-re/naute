import { useEffect, useRef, useState } from "react";

import type { SortField, SortOrder } from "../types";
import { cn } from "../utils";

interface Option {
  label: string;
  value: SortField;
}

const SORT_OPTIONS: Option[] = [
  { label: "Created", value: "createdAt" },
  { label: "Modified", value: "updatedAt" },
  { label: "Title", value: "title" },
];

interface Props {
  order: SortOrder;
  sort: SortField;
  onOrderChange: (order: SortOrder) => void;
  onSortChange: (sort: SortField) => void;
}

export const Dropdown = ({
  order,
  sort,
  onOrderChange,
  onSortChange,
}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const currentLabel = SORT_OPTIONS.find(
    (option) => option.value === sort,
  )!.label;

  const handleOptionsToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelectFactory = (option: Option) => () => {
    onSortChange(option.value);
    setIsOpen(false);
  };

  const handleOrderChange = () => {
    onOrderChange(order === "asc" ? "desc" : "asc");
  };

  return (
    <div className="mb-5 flex gap-2" ref={ref}>
      <div className="relative flex-1">
        <button
          onClick={handleOptionsToggle}
          className={cn(
            "flex w-full items-center justify-between",
            "rounded-lg border px-3.5 py-2.5 text-sm",
            "border-edge bg-panel text-ink-dim",
            "hover:bg-highlight transition-colors",
          )}
        >
          <span>{currentLabel}</span>
          <span className="material-icons-outlined text-base">
            {isOpen ? "expand_less" : "expand_more"}
          </span>
        </button>
        {isOpen && (
          <ul
            className={cn(
              "absolute left-0 top-full z-10 mt-1",
              "w-full overflow-hidden rounded-lg border",
              "border-edge bg-panel shadow-elevated",
            )}
          >
            {SORT_OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  onClick={handleOptionSelectFactory(option)}
                  className={cn(
                    "w-full px-3.5 py-2.5 text-left",
                    "text-sm transition-colors",
                    "hover:bg-active hover:text-active-fg",
                    sort === option.value
                      ? "text-ink font-medium"
                      : "text-ink-dim",
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={handleOrderChange}
        className={cn(
          "flex aspect-square items-center justify-center self-stretch rounded-lg",
          "bg-accent/15 text-accent hover:bg-accent/25 transition-colors",
        )}
        title={order === "asc" ? "Ascending" : "Descending"}
      >
        <span className="material-icons-outlined text-xl">
          {order === "asc" ? "arrow_upward" : "arrow_downward"}
        </span>
      </button>
    </div>
  );
};
