import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { Inspector } from "./components/Inspector";
import { FramesPanel } from "./components/FramesPanel";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/editor" replace />} />
          <Route path="editor" element={<Inspector />} />
          <Route path="frames" element={<FramesPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
