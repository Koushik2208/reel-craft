export const MAX_CHARS_PER_SCENE = 60;

export function splitTextIntoScenes(
  text: string,
  maxChars = MAX_CHARS_PER_SCENE
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxChars) return [trimmed];

  const units = toAtomicUnits(trimmed, maxChars);
  return greedyPack(units, maxChars);
}

// Recursively reduces text to units <= maxChars, honouring the boundary
// priority: paragraph (\n\n) > line (\n) > sentence > clause > word.
function toAtomicUnits(text: string, maxChars: number): string[] {
  const units: string[] = [];
  for (const para of text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)) {
    if (para.length <= maxChars) {
      units.push(para);
    } else {
      units.push(...splitByLines(para, maxChars));
    }
  }
  return units;
}

function splitByLines(text: string, maxChars: number): string[] {
  const units: string[] = [];
  for (const line of text.split(/\n/).map((s) => s.trim()).filter(Boolean)) {
    if (line.length <= maxChars) {
      units.push(line);
    } else {
      units.push(...splitBySentences(line, maxChars));
    }
  }
  return units;
}

function splitBySentences(text: string, maxChars: number): string[] {
  const units: string[] = [];
  for (const s of text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)) {
    if (s.length <= maxChars) {
      units.push(s);
    } else {
      units.push(...splitByClauses(s, maxChars));
    }
  }
  return units;
}

function splitByClauses(text: string, maxChars: number): string[] {
  const units: string[] = [];
  for (const s of text.split(/(?<=[,;:])\s+/).map((s) => s.trim()).filter(Boolean)) {
    if (s.length <= maxChars) {
      units.push(s);
    } else {
      units.push(...splitByWords(s, maxChars));
    }
  }
  return units;
}

// Last resort: word boundaries. Never splits mid-word; a word longer than
// maxChars becomes its own oversized chunk rather than being cut.
function splitByWords(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current = current + " " + word;
    } else {
      chunks.push(current);
      current = word;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// Greedy packing: combine consecutive units (joined with a space) until adding
// the next would exceed maxChars, then start a new chunk.
function greedyPack(units: string[], maxChars: number): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const unit of units) {
    if (!current) {
      current = unit;
    } else if (current.length + 1 + unit.length <= maxChars) {
      current = current + " " + unit;
    } else {
      chunks.push(current);
      current = unit;
    }
  }
  if (current) chunks.push(current);
  return chunks.filter((c) => c.trim());
}
