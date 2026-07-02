import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { SceneListPage } from "./pages/SceneListPage";
import { ScenePage } from "./pages/ScenePage";
import { FramesPanel } from "./components/FramesPanel";
import { OverlaysPanel } from "./components/OverlaysPanel";
import { PromptsPanel } from "../prompts/PromptsPanel";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="editor" element={<SceneListPage />} />
          <Route path="editor/scene/:sceneId" element={<ScenePage />} />
          <Route path="frames" element={<FramesPanel />} />
          <Route path="overlays" element={<OverlaysPanel />} />
          <Route path="prompts" element={<PromptsPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
