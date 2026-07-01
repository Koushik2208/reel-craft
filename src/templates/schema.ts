import { z } from "zod";

export const TEMPLATE_IDS = ["minimal", "cinematic", "imageCard"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const LAYER_MODES = ["full", "greenscreen", "background-only"] as const;
export type LayerMode = (typeof LAYER_MODES)[number];

// The single object every template is a pure function of.
// Content lives here; all design lives inside the template + its variant.
export const videoPropsSchema = z.object({
  text: z.string().min(1, "Add some text"),
  backgroundSrc: z.string().nullable().default(null),
  variant: z.string().default("default"),
  language: z.enum(["en", "te"]).default("en"),
  layerMode: z.enum(LAYER_MODES).default("full"),
  textColorOverride: z.string().nullable().default(null),
});

export type VideoProps = z.infer<typeof videoPropsSchema>;

export type Variant = { id: string; label: string; colors?: { bg: string; text: string } };
