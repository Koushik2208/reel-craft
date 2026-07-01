import React from "react";
import { AbsoluteFill } from "remotion";
import type { TemplateId, VideoProps } from "../../templates/schema";
import { TEMPLATES } from "../../templates/registry";

export type CompositionProps = VideoProps & { template: TemplateId };

// One component the Player and the renderer both point at. Picking the
// template here (rather than swapping the Player's component) keeps a single
// stable composition id, which the web renderer wants.
export const VideoComposition: React.FC<CompositionProps> = ({ template, ...rest }) => {
  const meta = TEMPLATES[template] ?? TEMPLATES.minimal;
  const Template = meta.component;
  return (
    <AbsoluteFill>
      <Template {...rest} />
    </AbsoluteFill>
  );
};
