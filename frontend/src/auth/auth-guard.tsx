import { type PropsWithChildren, useContext } from "react";

import { cn } from "../utils";

import { AuthContext } from "./auth-context";

export const AuthGuard = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isLoading, login } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="bg-base flex h-screen items-center justify-center">
        <div
          className={cn(
            "size-8 animate-spin rounded-full",
            "border-4 border-accent border-t-transparent",
          )}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    login();

    return (
      <div className="bg-base flex h-screen items-center justify-center">
        <p className="text-ink-muted">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
};
