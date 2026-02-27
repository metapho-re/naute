import { cn } from "../utils";

import { useCallbackPage } from "./use-callback-page";

export const CallbackPage = () => {
  const { error, login } = useCallbackPage();

  if (error) {
    return (
      <div className="bg-base flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-danger">Authentication failed: {error}</p>
          <button
            onClick={login}
            className={cn(
              "mt-4 rounded-lg px-4 py-2 font-medium transition-colors",
              "bg-accent text-accent-fg hover:bg-accent-hover",
            )}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base flex h-screen items-center justify-center">
      <p className="text-ink-muted">Signing in...</p>
    </div>
  );
};
