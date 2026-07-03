import React from "react";
import { useStore } from "../store";

export const ProjectTitleInput: React.FC = () => {
  const { projectTitle, setProjectTitle } = useStore();

  return (
    <input
      type="text"
      value={projectTitle}
      onChange={(e) => setProjectTitle(e.target.value)}
      placeholder="Untitled Reel"
      maxLength={100}
      className="w-full max-w-sm rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-muted/60 focus:border-accent-purple"
    />
  );
};
