import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { SceneListPage } from "./pages/SceneListPage";
import { ScenePage } from "./pages/ScenePage";
import { FramesPanel } from "./components/FramesPanel";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/editor" replace />} />
          <Route path="editor" element={<SceneListPage />} />
          <Route path="editor/scene/:sceneId" element={<ScenePage />} />
          <Route path="frames" element={<FramesPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
