import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AuthGuard } from "./auth";
import { Navbar } from "./components";
import {
  CallbackPage,
  LandingPage,
  NoteEditorPage,
  NoteListPage,
  NoteViewPage,
} from "./pages";

export const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/callback" element={<CallbackPage />} />
    <Route
      element={
        <AuthGuard>
          <div className="flex h-screen flex-col">
            <Navbar />
            <Outlet />
          </div>
        </AuthGuard>
      }
    >
      <Route path="/notes" element={<NoteListPage />} />
      <Route path="/notes/new" element={<NoteEditorPage />} />
      <Route path="/notes/:id" element={<NoteViewPage />} />
      <Route path="/notes/:id/edit" element={<NoteEditorPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/notes" replace />} />
  </Routes>
);
