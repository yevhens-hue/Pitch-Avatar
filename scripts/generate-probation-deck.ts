/**
 * Генератор презентации по итогам испытательного срока.
 *
 * Из единого источника истины (src/data/probation-data.ts) собирает два артефакта:
 *   1. probation-presentation.pptx  — нативная, редактируемая презентация PowerPoint (14 слайдов).
 *   2. probation-transcripts.md/.txt — отдельные дикторские транскрипты по каждому слайду.
 *
 * Запуск:  npx -y tsx scripts/generate-probation-deck.ts
 *
 * Интерактивный плеер (/roadmap-final) при этом не затрагивается — он остаётся
 * вторым «представлением» тех же данных.
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import PptxGenJS from 'pptxgenjs';
import {
  probationSlides,
  STATUS_LABELS,
  type ProbationSlide,
  type StatusKind,
} from '../src/data/probation-data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Цветовая палитра (синхронизирована с тёмной темой плеера) ──────────────
const C = {
  bgDark: '0F1620',
  bgMid: '161F2E',
  card: '1C2738',
  cardBorder: '2A3850',
  stripeTop: '3B82F6',
  stripeBottom: '6366F1',
  accent: '60A5FA',
  title: 'F1F5F9',
  text: 'CBD5E1',
  muted: '94A3B8',
  faint: '64748B',
} as const;

// Цвет статуса для бейджей.
const STATUS_COLOR: Record<StatusKind, string> = {
  done: '4ADE80',
  progress: '60A5FA',
  review: 'FBBF24',
  blocked: 'F87171',
  planned: '818CF8',
};

// Акцентные цвета метрик.
const ACCENT_COLOR: Record<string, string> = {
  blue: '60A5FA',
  green: '4ADE80',
  amber: 'FBBF24',
  red: 'F87171',
};

const FONT = 'Arial'; // безопасный системный шрифт для PowerPoint
const AUTHOR = 'Yevhen Shaforostov · Product Manager';
// Базовое имя выходных файлов (pptx + транскрипты получают те же расширения).
const OUT_BASENAME = 'Probation_Review_Yevhen_Shaforostov';

// ── Геометрия слайда 16:9 (13.333 × 7.5") ──────────────────────────────────
const PAGE_W = 13.333;
const PAGE_H = 7.5;
const MARGIN = 0.85;
const CONTENT_W = PAGE_W - MARGIN * 2;

function addHeader(slide: PptxGenJS.Slide, s: ProbationSlide, index: number, total: number): number {
  // Левая акцентная полоса.
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 0.13,
    h: PAGE_H,
    fill: { type: 'solid', color: C.stripeTop },
    line: { type: 'none' },
  });

  // Номер слайда.
  slide.addText(`${index + 1} / ${total}`, {
    x: PAGE_W - 2.2,
    y: 0.4,
    w: 1.8,
    h: 0.3,
    align: 'right',
    fontFace: FONT,
    fontSize: 11,
    bold: true,
    color: C.faint,
    charSpacing: 2,
  });

  // Тег раздела.
  slide.addText(s.tag.toUpperCase(), {
    x: MARGIN,
    y: 0.55,
    w: CONTENT_W,
    h: 0.35,
    fontFace: FONT,
    fontSize: 12,
    bold: true,
    color: C.accent,
    charSpacing: 2,
  });

  // Заголовок.
  slide.addText(s.title, {
    x: MARGIN,
    y: 0.95,
    w: CONTENT_W,
    h: 0.9,
    fontFace: FONT,
    fontSize: 30,
    bold: true,
    color: C.title,
  });

  let y = 1.95;
  if (s.subtitle) {
    slide.addText(s.subtitle, {
      x: MARGIN,
      y,
      w: CONTENT_W,
      h: 0.4,
      fontFace: FONT,
      fontSize: 15,
      color: C.muted,
    });
    y += 0.6;
  }
  return y + 0.25;
}

// Универсальный буллет-список.
function addBullets(
  slide: PptxGenJS.Slide,
  items: string[],
  topY: number,
  bulletColor: string,
): void {
  slide.addText(
    items.map((t) => ({
      text: t,
      options: { bullet: { code: '2022', indent: 18 }, color: C.text, breakLine: true },
    })),
    {
      x: MARGIN,
      y: topY,
      w: CONTENT_W,
      h: PAGE_H - topY - 0.5,
      fontFace: FONT,
      fontSize: 16,
      color: C.text,
      lineSpacingMultiple: 1.3,
      valign: 'top',
      paraSpaceAfter: 8,
      bullet: { code: '2022', indent: 18 },
    },
  );
  // Цветной акцент буллетов задаётся через первый прогон — pptxgenjs не красит
  // маркер отдельно, поэтому используем единый текстовый цвет и заметный отступ.
  void bulletColor;
}

// ── Титульный (стартовый) слайд ────────────────────────────────────────────
// Создаёт отдельный самостоятельный титульный слайд (без счётчика и хедера).
function addTitleSlide(pptx: PptxGenJS): void {
  const s = probationSlides[0];
  const slide = pptx.addSlide();
  slide.background = { color: C.bgDark };

  // Декоративные акцентные «свечения» по углам.
  slide.addShape('rect', { x: -1, y: -1, w: 4, h: 4, fill: { color: C.bgMid }, line: { type: 'none' }, rotate: 25 });
  slide.addShape('rect', { x: PAGE_W - 3, y: PAGE_H - 3, w: 4.5, h: 4.5, fill: { color: C.bgMid }, line: { type: 'none' }, rotate: 25 });

  // Декоративная двухцветная полоса сверху.
  slide.addShape('rect', { x: 0, y: 0, w: PAGE_W / 2, h: 0.16, fill: { color: C.stripeTop }, line: { type: 'none' } });
  slide.addShape('rect', { x: PAGE_W / 2, y: 0, w: PAGE_W / 2, h: 0.16, fill: { color: C.stripeBottom }, line: { type: 'none' } });

  // Тег-метка (kicker).
  slide.addText(s.tag.toUpperCase(), {
    x: MARGIN,
    y: 1.5,
    w: CONTENT_W,
    h: 0.4,
    align: 'center',
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.accent,
    charSpacing: 3,
  });

  // Главный заголовок.
  slide.addText(s.title, {
    x: MARGIN,
    y: 2.1,
    w: CONTENT_W,
    h: 1.6,
    align: 'center',
    valign: 'middle',
    fontFace: FONT,
    fontSize: 46,
    bold: true,
    color: C.title,
  });

  // Подзаголовок.
  if (s.subtitle) {
    slide.addText(s.subtitle, {
      x: MARGIN + 1,
      y: 3.7,
      w: CONTENT_W - 2,
      h: 0.8,
      align: 'center',
      valign: 'top',
      fontFace: FONT,
      fontSize: 17,
      color: C.muted,
    });
  }

  // Разделитель.
  slide.addShape('rect', {
    x: PAGE_W / 2 - 0.6,
    y: 4.75,
    w: 1.2,
    h: 0.04,
    fill: { color: C.stripeTop },
    line: { type: 'none' },
  });

  // Автор / дата.
  slide.addText(`${AUTHOR}   ·   Июнь 2026`, {
    x: MARGIN,
    y: 5.0,
    w: CONTENT_W,
    h: 0.4,
    align: 'center',
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.text,
    charSpacing: 1,
  });

  // Метрики компактной полосой снизу.
  if (s.content.kind === 'summary') {
    const metrics = s.content.metrics;
    const gap = 0.4;
    const stripW = CONTENT_W;
    const cellW = (stripW - gap * (metrics.length - 1)) / metrics.length;
    const y = 5.85;
    metrics.forEach((m, i) => {
      const x = MARGIN + i * (cellW + gap);
      slide.addText(m.value, {
        x,
        y,
        w: cellW,
        h: 0.6,
        align: 'center',
        fontFace: FONT,
        fontSize: 32,
        bold: true,
        color: ACCENT_COLOR[m.accent ?? 'blue'] ?? C.accent,
      });
      slide.addText(m.label, {
        x,
        y: y + 0.62,
        w: cellW,
        h: 0.5,
        align: 'center',
        valign: 'top',
        fontFace: FONT,
        fontSize: 11,
        color: C.muted,
      });
    });
  }

  // Дикторский текст вступления — в заметки докладчика.
  slide.addNotes(s.script);
}

function renderSummary(slide: PptxGenJS.Slide, metrics: { label: string; value: string; accent?: string }[], topY: number) {
  const gap = 0.3;
  const cardW = (CONTENT_W - gap * (metrics.length - 1)) / metrics.length;
  const cardH = 2.1;
  metrics.forEach((m, i) => {
    const x = MARGIN + i * (cardW + gap);
    slide.addShape('roundRect', {
      x,
      y: topY,
      w: cardW,
      h: cardH,
      rectRadius: 0.08,
      fill: { type: 'solid', color: C.card },
      line: { color: C.cardBorder, width: 1 },
    });
    slide.addText(m.value, {
      x,
      y: topY + 0.35,
      w: cardW,
      h: 0.9,
      align: 'center',
      fontFace: FONT,
      fontSize: 44,
      bold: true,
      color: ACCENT_COLOR[m.accent ?? 'blue'] ?? C.accent,
    });
    slide.addText(m.label, {
      x: x + 0.15,
      y: topY + 1.35,
      w: cardW - 0.3,
      h: 0.6,
      align: 'center',
      valign: 'top',
      fontFace: FONT,
      fontSize: 13,
      color: C.muted,
    });
  });
}

function renderOverview(slide: PptxGenJS.Slide, items: { name: string; status: StatusKind }[], topY: number) {
  const rowH = 0.52;
  items.forEach((it, i) => {
    const y = topY + i * rowH;
    slide.addText(it.name, {
      x: MARGIN,
      y,
      w: CONTENT_W * 0.65,
      h: rowH,
      valign: 'middle',
      fontFace: FONT,
      fontSize: 16,
      bold: true,
      color: C.title,
    });
    slide.addText(STATUS_LABELS[it.status], {
      x: MARGIN + CONTENT_W * 0.65,
      y,
      w: CONTENT_W * 0.35,
      h: rowH,
      valign: 'middle',
      align: 'right',
      fontFace: FONT,
      fontSize: 14,
      bold: true,
      color: STATUS_COLOR[it.status],
    });
  });
}

function renderTask(
  slide: PptxGenJS.Slide,
  content: { status: string; statusKind: StatusKind; deliverables: string[]; links?: { label: string; url: string }[] },
  topY: number,
) {
  // Бейдж статуса.
  slide.addText(content.status, {
    x: MARGIN,
    y: topY,
    w: CONTENT_W,
    h: 0.5,
    fontFace: FONT,
    fontSize: 15,
    bold: true,
    color: STATUS_COLOR[content.statusKind],
  });

  // Результаты.
  slide.addText(
    content.deliverables.map((t) => ({
      text: t,
      options: { bullet: { code: '2713', indent: 20 }, color: C.text, breakLine: true },
    })),
    {
      x: MARGIN,
      y: topY + 0.6,
      w: CONTENT_W,
      h: 2.6,
      fontFace: FONT,
      fontSize: 16,
      color: C.text,
      lineSpacingMultiple: 1.25,
      valign: 'top',
      paraSpaceAfter: 8,
    },
  );

  // Ссылки.
  if (content.links && content.links.length > 0) {
    const linkY = PAGE_H - 1.3;
    slide.addText(
      content.links.map((l, i) => ({
        text: `${l.label}${i < content.links!.length - 1 ? '    ' : ''}`,
        options: {
          hyperlink: { url: l.url, tooltip: l.label },
          color: C.accent,
          underline: { style: 'sng' as const },
          breakLine: true,
        },
      })),
      {
        x: MARGIN,
        y: linkY,
        w: CONTENT_W,
        h: 1,
        fontFace: FONT,
        fontSize: 12,
        valign: 'top',
      },
    );
  }
}

function renderChips(slide: PptxGenJS.Slide, items: string[], topY: number) {
  const gap = 0.25;
  const chipH = 0.55;
  let x = MARGIN;
  let y = topY;
  items.forEach((label) => {
    const w = Math.min(CONTENT_W, 0.45 + label.length * 0.13);
    if (x + w > MARGIN + CONTENT_W) {
      x = MARGIN;
      y += chipH + gap;
    }
    slide.addShape('roundRect', {
      x,
      y,
      w,
      h: chipH,
      rectRadius: 0.27,
      fill: { type: 'solid', color: C.card },
      line: { color: C.accent, width: 1 },
    });
    slide.addText(label, {
      x,
      y,
      w,
      h: chipH,
      align: 'center',
      valign: 'middle',
      fontFace: FONT,
      fontSize: 14,
      bold: true,
      color: C.accent,
    });
    x += w + gap;
  });
}

function renderClosing(slide: PptxGenJS.Slide, points: string[], topY: number) {
  addBullets(slide, points, topY, C.accent);
}

function buildPptx(): Promise<string> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'WIDE', width: PAGE_W, height: PAGE_H });
  pptx.layout = 'WIDE';
  pptx.author = 'Pitch Avatar';
  pptx.title = 'Итоги испытательного срока';

  const total = probationSlides.length;

  // Отдельный титульный слайд в начале колоды.
  addTitleSlide(pptx);

  probationSlides.forEach((s, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: index % 2 === 0 ? C.bgDark : C.bgMid };

    const topY = addHeader(slide, s, index, total);
    const c = s.content;

    switch (c.kind) {
      case 'summary':
        renderSummary(slide, c.metrics, topY);
        break;
      case 'overview':
        renderOverview(slide, c.items, topY);
        break;
      case 'task':
        renderTask(slide, c, topY);
        break;
      case 'list':
        renderChips(slide, c.items, topY);
        break;
      case 'closing':
        renderClosing(slide, c.points, topY);
        break;
    }

    // Дикторский текст — в заметки к слайду.
    slide.addNotes(s.script);
  });

  const outPath = resolve(ROOT, `${OUT_BASENAME}.pptx`);
  return pptx.writeFile({ fileName: outPath }).then(() => outPath);
}

function buildTranscripts(): { md: string; txt: string } {
  const mdParts: string[] = [
    '# Транскрипты презентации «Итоги испытательного срока»',
    '',
    '> Дикторский текст по каждому слайду. Источник: `src/data/probation-data.ts`.',
    '',
  ];
  const txtParts: string[] = ['ТРАНСКРИПТЫ — ИТОГИ ИСПЫТАТЕЛЬНОГО СРОКА', ''];

  probationSlides.forEach((s, i) => {
    const num = i + 1;
    mdParts.push(`## Слайд ${num}. ${s.title}`);
    if (s.subtitle) mdParts.push(`*${s.subtitle}*`);
    mdParts.push('', s.script, '');

    txtParts.push(`СЛАЙД ${num}. ${s.title}`);
    if (s.subtitle) txtParts.push(s.subtitle);
    txtParts.push('', s.script, '', '—'.repeat(60), '');
  });

  return { md: mdParts.join('\n'), txt: txtParts.join('\n') };
}

async function main() {
  const pptxPath = await buildPptx();
  console.log('✅  PPTX сохранён:', pptxPath);

  const { md, txt } = buildTranscripts();
  const mdPath = resolve(ROOT, `${OUT_BASENAME}.md`);
  const txtPath = resolve(ROOT, `${OUT_BASENAME}.txt`);
  writeFileSync(mdPath, md, 'utf8');
  writeFileSync(txtPath, txt, 'utf8');
  console.log('✅  Транскрипты сохранены:', mdPath, '/', txtPath);
}

main().catch((err) => {
  console.error('❌  Ошибка генерации:', err);
  process.exit(1);
});
