import React from "react";
import type { TemplateId, Variant, VideoProps } from "./schema";
import { Minimal, minimalVariants } from "./minimal/Minimal";
import { Cinematic, cinematicVariants } from "./cinematic/Cinematic";
import { ImageCard, imageCardVariants } from "./imageCard/ImageCard";

export type TemplateMeta = {
  id: TemplateId;
  label: string;
  blurb: string;
  /** what an uploaded background should be, if any */
  accepts: "none" | "image" | "video";
  component: React.FC<VideoProps>;
  variants: Variant[];
  defaultVariant: string;
};

// Adding a template = one entry here + one folder. Nothing else changes.
export const TEMPLATES: Record<TemplateId, TemplateMeta> = {
  minimal: {
    id: "minimal",
    label: "Minimal",
    blurb: "Solid color, clean type",
    accepts: "none",
    component: Minimal,
    variants: minimalVariants,
    defaultVariant: "ink",
  },
  cinematic: {
    id: "cinematic",
    label: "Cinematic",
    blurb: "Video, dark overlay, slow zoom",
    accepts: "video",
    component: Cinematic,
    variants: cinematicVariants,
    defaultVariant: "noir",
  },
  imageCard: {
    id: "imageCard",
    label: "Image Card",
    blurb: "Photo, gradient, pan",
    accepts: "image",
    component: ImageCard,
    variants: imageCardVariants,
    defaultVariant: "frost",
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);
