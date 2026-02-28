import { useContext } from "react";

import { AuthContext } from "../auth";
import { cn } from "../utils";

export const LandingPage = () => {
  const { login } = useContext(AuthContext);

  return (
    <div className="bg-base relative flex h-screen flex-col items-center justify-center gap-8">
      <img src="/icon.svg" alt="" className="size-240 absolute opacity-10" />
      <h1 className="text-ink relative text-4xl font-bold">Naute</h1>
      <p className="text-ink-muted relative text-lg">
        A markdown note-taking app
      </p>
      <button
        type="button"
        onClick={login}
        className={cn(
          "relative rounded-lg px-6 py-3 text-lg font-medium",
          "bg-accent text-on-accent",
          "hover:bg-accent-hover transition-colors",
        )}
      >
        Login
      </button>
    </div>
  );
};
