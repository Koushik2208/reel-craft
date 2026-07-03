import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { SceneListPage } from "./pages/SceneListPage";
import { ScenePage } from "./pages/ScenePage";
import { LinkedPage } from "./pages/LinkedPage";
import { StylePage } from "./pages/StylePage";
import { FramesPanel } from "./components/FramesPanel";
import { OverlaysPanel } from "./components/OverlaysPanel";
import { MotionPanel } from "./components/MotionPanel";
import { PromptsPanel } from "../prompts/PromptsPanel";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="editor" element={<SceneListPage />} />
          <Route path="editor/scene/:sceneId" element={<ScenePage />} />
          <Route path="editor/linked" element={<LinkedPage />} />
          <Route path="style" element={<StylePage />} />
          <Route path="frames" element={<FramesPanel />} />
          <Route path="overlays" element={<OverlaysPanel />} />
          <Route path="motion" element={<MotionPanel />} />
          <Route path="prompts" element={<PromptsPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
