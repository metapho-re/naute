import { useContext } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../auth";
import { ThemeContext } from "../theme";
import { cn } from "../utils";

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav
      className={cn(
        "flex items-center justify-between",
        "border-edge bg-surface border-b px-8 py-3",
      )}
    >
      <Link
        to="/notes"
        className={cn(
          "flex items-center gap-2.5",
          "text-ink text-xl font-bold no-underline",
        )}
      >
        <svg
          viewBox="0 -50 512 512"
          className="text-accent size-10"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M247 40l-74.6 161.6 74.6 24.9V40zm18 0v186.5l74.6-24.9L265 40zm-86.7 105.8l-136.02 17 112.02 35 24-52zm155.4 0l24 52 112.1-35-136.1-17zM25.48 176.4L130 307.1l104.6-65.4-209.12-65.3zm461.02 0l-209.1 65.3L382 307.1l104.5-130.7zM256 249.6L159.4 310h193.2L256 249.6z"
          />
        </svg>
        Naute
      </Link>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={cn(
            "flex size-9 items-center justify-center",
            "rounded-lg transition-colors",
            "bg-accent/15 text-accent hover:bg-accent/25",
          )}
          title={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          <span className="material-icons-outlined text-xl">
            {theme === "light" ? "dark_mode" : "light_mode"}
          </span>
        </button>
        {user && (
          <button
            onClick={logout}
            className={cn(
              "flex size-9 items-center justify-center",
              "rounded-lg transition-colors",
              "bg-danger/15 text-danger hover:bg-danger/25",
            )}
            title="Logout"
          >
            <span className="material-icons-outlined text-xl">logout</span>
          </button>
        )}
      </div>
    </nav>
  );
};
