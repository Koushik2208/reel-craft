import type { TranscriptKind } from "./store";

export type SrtEntry = {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
};

const TIMESTAMP_RE =
  /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/;

function timestampToMs(h: string, m: string, s: string, ms: string): number {
  return (
    Number(h) * 3_600_000 +
    Number(m) * 60_000 +
    Number(s) * 1_000 +
    Number(ms)
  );
}

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

// Splits an SRT file into blocks separated by one or more blank lines.
// Normalizes CRLF/CR to LF first so the blank-line split is reliable.
function splitBlocks(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
}

export function parseSRT(raw: string): SrtEntry[] {
  const blocks = splitBlocks(raw);
  const entries: SrtEntry[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim());
    if (lines.length < 2) continue;

    const index = Number.parseInt(lines[0], 10);
    if (Number.isNaN(index)) continue;

    const timestampMatch = TIMESTAMP_RE.exec(lines[1]);
    if (!timestampMatch) continue;

    const [, h1, m1, s1, ms1, h2, m2, s2, ms2] = timestampMatch;
    const startMs = timestampToMs(h1, m1, s1, ms1);
    const endMs = timestampToMs(h2, m2, s2, ms2);
    if (endMs <= startMs) continue;

    const text = stripHtmlTags(lines.slice(2).join(" "))
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;

    entries.push({ index, startMs, endMs, text });
  }

  return entries;
}

export function srtEntriesToTranscript(entries: SrtEntry[]): TranscriptKind {
  return {
    kind: "block",
    blocks: entries.map((e) => ({ text: e.text, startMs: e.startMs, endMs: e.endMs })),
  };
}
