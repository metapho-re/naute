import { type PropsWithChildren, useContext } from "react";
import { Navigate } from "react-router-dom";

import { cn } from "../utils";

import { AuthContext } from "./auth-context";

export const AuthGuard = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
