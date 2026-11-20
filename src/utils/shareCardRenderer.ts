import heroSunsetArtUrl from '../assets/images/vice_sunset_hero_1795131903658.jpg';
import type { ExcuseResult } from '../types/excuse';
import {
  CHANNEL_OPTIONS,
  EXPRESSION_OPTIONS,
  PERSONA_OPTIONS,
} from '../types/excuse';
import { wrapStyledLines, type StyledLine } from './shareCardLayout';

export interface RenderedShareCard {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

const CARD_WIDTH = 1080;
const MIN_CARD_HEIGHT = 1350;
const OUTER_PAD = 68;
const PANEL_PAD_X = 56;
const PANEL_PAD_Y = 50;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number,
) {
  const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
  const boxRatio = dWidth / Math.max(1, dHeight);
  let sx = 0;
  let sy = 0;
  let sWidth = img.naturalWidth;
  let sHeight = img.naturalHeight;

  if (imgRatio > boxRatio) {
    sWidth = img.naturalHeight * boxRatio;
    sx = (img.naturalWidth - sWidth) / 2;
  } else {
    sHeight = img.naturalWidth / boxRatio;
    sy = (img.naturalHeight - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

function drawOriginalViEmblem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Clip path matching ViceEmblem.tsx geometric V + I
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(12, 12);
  ctx.lineTo(60, 12);
  ctx.lineTo(88, 94);
  ctx.lineTo(116, 12);
  ctx.lineTo(164, 12);
  ctx.lineTo(109, 144);
  ctx.lineTo(67, 144);
  ctx.closePath();
  ctx.rect(166, 12, 42, 132);
  ctx.clip();

  const emblemGrad = ctx.createLinearGradient(0, 0, 0, 156);
  emblemGrad.addColorStop(0, '#6D4178');
  emblemGrad.addColorStop(0.5, '#C97395');
  emblemGrad.addColorStop(0.84, '#F4B08B');
  emblemGrad.addColorStop(1, '#FFB0C4');
  ctx.fillStyle = emblemGrad;
  ctx.fillRect(0, 0, 220, 156);

  // Stylized palm trunks & fronds inside emblem
  ctx.strokeStyle = '#26173B';
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(52, 148);
  ctx.bezierCurveTo(56, 106, 60, 72, 64, 46);
  ctx.moveTo(196, 148);
  ctx.bezierCurveTo(190, 108, 186, 76, 184, 48);
  ctx.stroke();

  ctx.lineWidth = 3.2;
  const fronds: Array<[number, number, number, number, number, number]> = [
    [64, 46, 38, 38, 14, 54],
    [64, 46, 40, 22, 18, 22],
    [64, 46, 76, 18, 96, 14],
    [64, 46, 92, 42, 112, 60],
    [64, 46, 44, 64, 30, 88],
    [184, 48, 162, 40, 144, 54],
    [184, 48, 166, 24, 148, 24],
    [184, 48, 200, 22, 218, 20],
    [184, 48, 204, 46, 218, 64],
  ];
  for (const [sx, sy, cx, cy, ex, ey] of fronds) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
  ctx.restore();

  // Crisp pure white stroke border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4.5;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(12, 12);
  ctx.lineTo(60, 12);
  ctx.lineTo(88, 94);
  ctx.lineTo(116, 12);
  ctx.lineTo(164, 12);
  ctx.lineTo(109, 144);
  ctx.lineTo(67, 144);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeRect(166, 12, 42, 132);

  ctx.restore();
}

/**
 * Canvas 2D renderer producing a 1080x1350+ Leonida Sunset postcard PNG
 * using our original custom coastal sunset illustration + fallback gradient.
 */
export async function renderShareCardPng(
  excuse: ExcuseResult,
): Promise<RenderedShareCard> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed cleanly with available fonts
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  const displayFont = '"Outfit", system-ui, sans-serif';
  const bodyFont = '"Plus Jakarta Sans", system-ui, sans-serif';

  const bodySize = excuse.channel === 'email' ? 30 : 34;
  const lineHeight = excuse.channel === 'email' ? 46 : 52;
  const panelWidth = CARD_WIDTH - OUTER_PAD * 2;
  const textMaxWidth = panelWidth - PANEL_PAD_X * 2;

  const measureWithWeight = (text: string, bold: boolean) => {
    ctx.font = `${bold ? 700 : 500} ${bodySize}px ${bodyFont}`;
    return ctx.measureText(text).width;
  };

  const wrappedBody: StyledLine[] = wrapStyledLines(
    excuse.message,
    excuse.channel === 'telegram',
    textMaxWidth,
    measureWithWeight,
  );

  const subjectLines: StyledLine[] =
    excuse.channel === 'email' && excuse.subject
      ? wrapStyledLines(
          `Subject: ${excuse.subject}`,
          false,
          textMaxWidth,
          (text: string) => {
            ctx.font = `700 28px ${bodyFont}`;
            return ctx.measureText(text).width;
          },
        )
      : [];

  const headerBlockHeight = 330;
  const subjectBlockHeight =
    subjectLines.length > 0 ? subjectLines.length * 40 + 44 : 0;
  const bodyBlockHeight = wrappedBody.length * lineHeight;
  const panelInnerHeight =
    PANEL_PAD_Y * 2 + 64 + subjectBlockHeight + bodyBlockHeight + 54;
  const footerBlockHeight = 148;

  const totalHeight = Math.max(
    MIN_CARD_HEIGHT,
    OUTER_PAD + headerBlockHeight + panelInnerHeight + footerBlockHeight + OUTER_PAD,
  );

  canvas.width = CARD_WIDTH;
  canvas.height = totalHeight;

  // 1. Base obsidian-indigo canvas + Leonida Sunset illustration header backdrop
  ctx.fillStyle = '#110E1A';
  ctx.fillRect(0, 0, CARD_WIDTH, totalHeight);

  const heroBandHeight = Math.round(totalHeight * 0.56);
  const bgImg = await loadImageSafe(heroSunsetArtUrl);

  if (bgImg && bgImg.naturalWidth > 0) {
    drawCoverImage(ctx, bgImg, 0, 0, CARD_WIDTH, heroBandHeight);
  } else {
    const fallbackSky = ctx.createLinearGradient(0, 0, 0, heroBandHeight);
    fallbackSky.addColorStop(0, '#4F2E5C');
    fallbackSky.addColorStop(0.45, '#A45985');
    fallbackSky.addColorStop(0.78, '#F0A48C');
    fallbackSky.addColorStop(1, '#110E1A');
    ctx.fillStyle = fallbackSky;
    ctx.fillRect(0, 0, CARD_WIDTH, heroBandHeight);
  }

  // Smooth multi-stop melt from coastal sunset into deep obsidian-indigo #110E1A
  const scrimGrad = ctx.createLinearGradient(0, 0, 0, heroBandHeight + 80);
  scrimGrad.addColorStop(0, 'rgba(17, 14, 26, 0.42)');
  scrimGrad.addColorStop(0.38, 'rgba(26, 21, 40, 0.35)');
  scrimGrad.addColorStop(0.76, 'rgba(17, 14, 26, 0.90)');
  scrimGrad.addColorStop(1, '#110E1A');
  ctx.fillStyle = scrimGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, heroBandHeight + 80);

  // Subtle postcard frame border
  ctx.strokeStyle = 'rgba(255, 176, 196, 0.24)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 28, 28, CARD_WIDTH - 56, totalHeight - 56, 28);
  ctx.stroke();

  // 2. Editorial Header Lockup (Original VI emblem + Outfit white display headline)
  const personaLabel =
    PERSONA_OPTIONS.find((p) => p.id === excuse.persona)?.label ?? 'Corporate';
  const channelLabel =
    CHANNEL_OPTIONS.find((c) => c.id === excuse.channel)?.label ?? 'WhatsApp';
  const expressionLabel =
    EXPRESSION_OPTIONS.find((e) => e.id === excuse.expression)?.label ?? 'Casual';

  drawOriginalViEmblem(ctx, OUTER_PAD, OUTER_PAD + 34, 1.05);

  const lockupTextX = OUTER_PAD + 258;
  ctx.textBaseline = 'top';
  ctx.font = `700 22px ${bodyFont}`;
  ctx.fillStyle = '#FFB0C4';
  ctx.fillText('LAUNCH DAY EDITION', lockupTextX, OUTER_PAD + 44);

  ctx.font = `800 84px ${displayFont}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('SICK DAY VI', lockupTextX, OUTER_PAD + 76);

  ctx.font = `600 24px ${bodyFont}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
  ctx.fillText(
    `${personaLabel}  /  ${channelLabel}  /  ${expressionLabel}`,
    lockupTextX,
    OUTER_PAD + 174,
  );

  // 3. Dark Frosted Leonida Excuse Panel
  const panelX = OUTER_PAD;
  const panelY = OUTER_PAD + headerBlockHeight;

  ctx.save();
  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelInnerHeight, 26);
  ctx.fillStyle = 'rgba(26, 21, 40, 0.94)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 176, 196, 0.34)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  let cursorY = panelY + PANEL_PAD_Y;

  ctx.font = `700 24px ${bodyFont}`;
  ctx.fillStyle = '#FFB0C4';
  ctx.fillText(`To: ${excuse.recipientDisplay}`, panelX + PANEL_PAD_X, cursorY);

  // Channel pill badge in top-right of panel
  const channelTag =
    excuse.channel === 'email'
      ? 'EMAIL'
      : excuse.channel === 'telegram'
        ? 'TELEGRAM'
        : 'WHATSAPP';
  ctx.font = `700 18px ${bodyFont}`;
  const tagTextW = ctx.measureText(channelTag).width;
  const badgeW = tagTextW + 32;
  const badgeH = 36;
  const badgeX = panelX + panelWidth - PANEL_PAD_X - badgeW;
  const badgeY = cursorY - 4;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 18);
  ctx.fillStyle = '#FFB0C4';
  ctx.fill();
  ctx.fillStyle = '#110E1A';
  ctx.fillText(channelTag, badgeX + 16, badgeY + 8);

  cursorY += 50;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(panelX + PANEL_PAD_X, cursorY, textMaxWidth, 1.5);
  cursorY += 26;

  if (subjectLines.length > 0) {
    ctx.font = `700 28px ${bodyFont}`;
    ctx.fillStyle = '#F5C08D';
    for (const line of subjectLines) {
      const lineStr = line.map((r) => r.text).join('');
      ctx.fillText(lineStr, panelX + PANEL_PAD_X, cursorY);
      cursorY += 40;
    }
    cursorY += 12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.fillRect(panelX + PANEL_PAD_X, cursorY, textMaxWidth, 1.5);
    cursorY += 24;
  }

  for (const line of wrappedBody) {
    if (line.length === 0) {
      cursorY += Math.round(lineHeight * 0.6);
      continue;
    }
    let cursorX = panelX + PANEL_PAD_X;
    for (const run of line) {
      ctx.font = `${run.bold ? 700 : 500} ${bodySize}px ${bodyFont}`;
      ctx.fillStyle = run.bold ? '#FFB0C4' : '#F7F4FA';
      ctx.fillText(run.text, cursorX, cursorY);
      cursorX += ctx.measureText(run.text).width;
    }
    cursorY += lineHeight;
  }

  if (excuse.channel !== 'email') {
    const stamp = excuse.channel === 'telegram' ? '09:16' : '09:14 AM';
    ctx.font = `500 21px ${bodyFont}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    const stampWidth = ctx.measureText(stamp).width;
    ctx.fillText(
      stamp,
      panelX + panelWidth - PANEL_PAD_X - stampWidth,
      panelY + panelInnerHeight - 50,
    );
  }

  // 4. Footer Band: Disclaimer + Credit
  const footerY = totalHeight - OUTER_PAD - 52;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.fillRect(OUTER_PAD, footerY - 24, CARD_WIDTH - OUTER_PAD * 2, 1.5);

  ctx.font = `500 23px ${bodyFont}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.76)';
  ctx.fillText('Sirf fun ke liye, apni zimmedari khud lena.', OUTER_PAD, footerY);

  ctx.font = `700 24px ${bodyFont}`;
  ctx.fillStyle = '#FFB0C4';
  const credit = 'thekhubaib.me';
  const creditWidth = ctx.measureText(credit).width;
  ctx.fillText(credit, CARD_WIDTH - OUTER_PAD - creditWidth, footerY);

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('PNG export failed'));
    }, 'image/png');
  });

  return {
    blob,
    dataUrl,
    width: CARD_WIDTH,
    height: totalHeight,
  };
}
