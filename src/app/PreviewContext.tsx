import React, { createContext, useContext } from "react";

export type PreviewMode = "scene" | "full";

const PreviewContext = createContext<PreviewMode>("full");

export const PreviewModeProvider: React.FC<{ mode: PreviewMode; children: React.ReactNode }> = ({
  mode,
  children,
}) => <PreviewContext.Provider value={mode}>{children}</PreviewContext.Provider>;

export function usePreviewMode(): PreviewMode {
  return useContext(PreviewContext);
}
