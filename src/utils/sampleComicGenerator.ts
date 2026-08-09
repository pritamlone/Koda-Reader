import JSZip from 'jszip';

export interface SamplePreset {
  id: string;
  title: string;
  fileName: string;
  pageCount: number;
  direction: 'ltr' | 'rtl';
  genre: 'Cyberpunk Manga' | 'Western Sci-Fi' | 'Classic Noir';
  description: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'cyberpunk_tokyo',
    title: 'Cyberpunk Tokyo 2099 - Ch. 01 [Manga RTL]',
    fileName: 'Cyberpunk_Tokyo_2099_Ch01.cbz',
    pageCount: 12,
    direction: 'rtl',
    genre: 'Cyberpunk Manga',
    description: 'A neon-drenched high-contrast manga chapter formatted in Right-to-Left (RTL) reading direction.',
  },
  {
    id: 'cosmic_odyssey',
    title: 'Cosmic Odyssey #01 - The Stellar Void [LTR]',
    fileName: 'Cosmic_Odyssey_01.cbz',
    pageCount: 10,
    direction: 'ltr',
    genre: 'Western Sci-Fi',
    description: 'Full-color Western comic spread layout with vivid nebulas and galactic starships.',
  },
  {
    id: 'noir_detective',
    title: 'Shadows of Gotham - Case File #10',
    fileName: 'Shadows_of_Gotham_10.cbz',
    pageCount: 8,
    direction: 'ltr',
    genre: 'Classic Noir',
    description: 'Monochrome atmospheric detective mystery with rain, shadows, and gritty comic panels.',
  },
];

/**
 * Renders custom comic pages onto HTML5 canvas and packages them into a valid .cbz (ZIP) file
 */
export async function generateSampleCBZ(presetId: string): Promise<Blob> {
  const preset = SAMPLE_PRESETS.find((p) => p.id === presetId) || SAMPLE_PRESETS[0];
  const zip = new JSZip();

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1700;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context failed');
  }

  for (let i = 0; i < preset.pageCount; i++) {
    const pageNumber = i + 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (preset.genre === 'Cyberpunk Manga') {
      renderMangaPage(ctx, canvas.width, canvas.height, pageNumber, preset.pageCount);
    } else if (preset.genre === 'Western Sci-Fi') {
      renderSciFiPage(ctx, canvas.width, canvas.height, pageNumber, preset.pageCount);
    } else {
      renderNoirPage(ctx, canvas.width, canvas.height, pageNumber, preset.pageCount);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

    // Pad file names for natural order test: 01.jpg, 02.jpg, ...
    const paddedNum = String(pageNumber).padStart(2, '0');
    zip.file(`page_${paddedNum}.jpg`, base64Data, { base64: true });
  }

  return await zip.generateAsync({ type: 'blob' });
}

function renderMangaPage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  page: number,
  total: number
) {
  // Dark Cyberpunk theme
  ctx.fillStyle = page === 1 ? '#0d0d15' : '#12121c';
  ctx.fillRect(0, 0, w, h);

  // Border frame
  ctx.strokeStyle = '#222238';
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, w - 60, h - 60);

  if (page === 1) {
    // Cover Page
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#110c22');
    grad.addColorStop(0.5, '#2e124d');
    grad.addColorStop(1, '#080512');
    ctx.fillStyle = grad;
    ctx.fillRect(40, 40, w - 80, h - 80);

    // Neon title
    ctx.fillStyle = '#ff2a85';
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CYBERPUNK TOKYO 2099', w / 2, 380);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '32px sans-serif';
    ctx.fillText('CHAPTER 1: NEON RAIN', w / 2, 450);

    // Neon Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 2;
    for (let y = 600; y < h - 200; y += 40) {
      ctx.beginPath();
      ctx.moveTo(100, y);
      ctx.lineTo(w - 100, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('[ MANGA RTL MODE - PAGE 1 (COVER) ]', w / 2, h - 120);
    return;
  }

  // Manga Panels
  ctx.fillStyle = '#1c1c2b';
  ctx.fillRect(60, 80, w - 120, 400); // Panel 1
  ctx.fillRect(60, 520, (w - 140) / 2, 500); // Panel 2
  ctx.fillRect((w - 140) / 2 + 80, 520, (w - 140) / 2, 500); // Panel 3
  ctx.fillRect(60, 1060, w - 120, 480); // Panel 4

  // Manga Screentone FX
  ctx.fillStyle = '#ff2a85';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`PANEL ACTION #${page}`, w / 2, 280);

  ctx.fillStyle = '#00f0ff';
  ctx.font = '24px monospace';
  ctx.fillText('⚡ SFX: ドドド (DODODO) ⚡', w / 2, 340);

  ctx.fillStyle = '#ffffff';
  ctx.font = '28px sans-serif';
  ctx.fillText(`Manga Right-to-Left • Page ${page} of ${total}`, w / 2, h - 90);
}

function renderSciFiPage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  page: number,
  total: number
) {
  // Vibrant space palette
  ctx.fillStyle = '#070b19';
  ctx.fillRect(0, 0, w, h);

  // Stars
  ctx.fillStyle = '#ffffff';
  for (let s = 0; s < 150; s++) {
    const sx = (Math.sin(s * 99 + page) * 0.5 + 0.5) * w;
    const sy = (Math.cos(s * 33 + page) * 0.5 + 0.5) * h;
    ctx.fillRect(sx, sy, Math.random() * 3, Math.random() * 3);
  }

  if (page === 1) {
    // Cover
    ctx.fillStyle = '#e5a93b';
    ctx.font = 'bold 80px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COSMIC ODYSSEY', w / 2, 320);

    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('#01 - THE STELLAR VOID', w / 2, 400);

    // Planet
    const planetGrad = ctx.createRadialGradient(w / 2 - 50, 900 - 50, 20, w / 2, 900, 250);
    planetGrad.addColorStop(0, '#38ef7d');
    planetGrad.addColorStop(1, '#11998e');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(w / 2, 900, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('[ WESTERN LTR - COVER PAGE ]', w / 2, h - 100);
    return;
  }

  // Sci-Fi Panels
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 8;
  ctx.strokeRect(60, 80, w - 120, h - 220);

  ctx.fillStyle = '#4ecdc4';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`SPACE EXPLORATION PAGE ${page}`, w / 2, 300);

  ctx.fillStyle = '#a0aec0';
  ctx.font = '24px sans-serif';
  ctx.fillText(`Western Left-to-Right Reading • Page ${page} / ${total}`, w / 2, h - 120);
}

function renderNoirPage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  page: number,
  total: number
) {
  // Grayscale Noir
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  if (page === 1) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOWS OF GOTHAM', w / 2, 350);

    ctx.font = 'italic 32px serif';
    ctx.fillText('CASE FILE #10: THE RAIN ON MAIN ST.', w / 2, 430);

    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('[ CLASSIC NOIR - COVER PAGE ]', w / 2, h - 120);
    return;
  }

  // Rain lines
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  for (let r = 0; r < 80; r++) {
    const rx = (r * 17) % w;
    const ry = (r * 29) % h;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 20, ry + 60);
    ctx.stroke();
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 36px serif';
  ctx.textAlign = 'center';
  ctx.fillText(`DETECTIVE LOG - ENTRY #${page}`, w / 2, 400);

  ctx.font = 'italic 24px serif';
  ctx.fillText(`"The rain never stopped that night..."`, w / 2, 480);

  ctx.font = '22px sans-serif';
  ctx.fillText(`Page ${page} of ${total}`, w / 2, h - 100);
}
