import { inter, playfair, bebas, baloo2, tiroTelugu, ramabhadra } from "./fonts";

export type Language = "en" | "te";

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: "en", label: "English" },
  { id: "te", label: "తెలుగు" },
];

export function getFontsForLanguage(language: Language): {
  primary: string;
  display: string;
  bold: string;
} {
  if (language === "te") {
    return { primary: baloo2, display: tiroTelugu, bold: ramabhadra };
  }
  return { primary: inter, display: playfair, bold: bebas };
}
