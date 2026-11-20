import type { Channel, Persona } from '../types/excuse';
import { parseTelegramSegments } from './excuseEngine';

export interface StyledToken {
  text: string;
  bold: boolean;
}

export type StyledLine = StyledToken[];

export type MeasureTextFn = (text: string, bold: boolean) => number;

/**
 * Wraps multi-paragraph text (with optional Telegram **bold** segments) into
 * display lines that fit within maxWidth using a pluggable measurement function.
 */
export function wrapStyledLines(
  text: string,
  allowBold: boolean,
  maxWidth: number,
  measureText: MeasureTextFn,
): StyledLine[] {
  const paragraphs = text.replace(/\r\n/g, '\n').split('\n');
  const lines: StyledLine[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.trim().length === 0) {
      lines.push([]);
      continue;
    }

    const segments = allowBold
      ? parseTelegramSegments(paragraph)
      : [{ text: paragraph, bold: false }];

    // Break segments into word + whitespace tokens while preserving bold flags
    const atoms: StyledToken[] = [];
    for (const seg of segments) {
      const parts = seg.text.match(/\S+\s*|\s+/g) ?? [];
      for (const part of parts) {
        atoms.push({ text: part, bold: seg.bold });
      }
    }

    let currentLine: StyledToken[] = [];
    let currentWidth = 0;

    for (const atom of atoms) {
      // Skip leading whitespace on a fresh line
      if (currentLine.length === 0 && atom.text.trim().length === 0) {
        continue;
      }

      const trimmedEndWidth = measureText(atom.text.trimEnd(), atom.bold);
      const fullAtomWidth = measureText(atom.text, atom.bold);

      if (
        currentLine.length > 0 &&
        currentWidth + trimmedEndWidth > maxWidth
      ) {
        // Trim trailing spaces on the finished line
        const last = currentLine[currentLine.length - 1];
        if (last) {
          currentLine[currentLine.length - 1] = {
            ...last,
            text: last.text.trimEnd(),
          };
        }
        lines.push(currentLine);
        currentLine = [];
        currentWidth = 0;

        if (atom.text.trim().length === 0) {
          continue;
        }
      }

      currentLine.push(atom);
      currentWidth += fullAtomWidth;
    }

    if (currentLine.length > 0) {
      const last = currentLine[currentLine.length - 1];
      if (last) {
        currentLine[currentLine.length - 1] = {
          ...last,
          text: last.text.trimEnd(),
        };
      }
      lines.push(currentLine);
    }
  }

  return lines;
}

export function buildShareFilename(persona: Persona, channel: Channel): string {
  const safePersona = persona.replace(/[^a-z0-9_-]/gi, '');
  const safeChannel = channel.replace(/[^a-z0-9_-]/gi, '');
  return `chhutti6-${safePersona}-${safeChannel}.png`;
}
