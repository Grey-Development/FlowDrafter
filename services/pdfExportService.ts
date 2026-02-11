/**
 * FlowDrafter PDF Export Service
 *
 * Exports plan sheets to high-definition PDF
 * Supports standard (72 DPI) and HD (300 DPI) output
 */

import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { PlanSheet } from '../types';
import { ARCH_D_WIDTH_PT, ARCH_D_HEIGHT_PT, ARCH_D_WIDTH_IN, ARCH_D_HEIGHT_IN } from '../utils/scaling';

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

export interface ExportConfig {
  /** DPI for rasterization (72 = standard, 300 = HD print quality) */
  dpi: 72 | 150 | 300;
  /** Image format for embedding */
  format: 'png' | 'jpeg';
  /** JPEG quality (0-1) if format is jpeg */
  jpegQuality?: number;
}

export const EXPORT_PRESETS = {
  standard: {
    dpi: 72 as const,
    format: 'png' as const,
  },
  highQuality: {
    dpi: 150 as const,
    format: 'png' as const,
  },
  printReady: {
    dpi: 300 as const,
    format: 'png' as const,
  },
  printReadyCompressed: {
    dpi: 300 as const,
    format: 'jpeg' as const,
    jpegQuality: 0.92,
  },
};

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export plan sheets to PDF with configurable resolution
 */
export async function exportPDF(
  sheets: PlanSheet[],
  projectName: string,
  config: ExportConfig = EXPORT_PRESETS.printReady
): Promise<void> {
  const pdfDoc = await PDFDocument.create();

  // Set PDF metadata
  pdfDoc.setTitle(`${projectName} - Irrigation Plan`);
  pdfDoc.setSubject('Irrigation Design Plan Set');
  pdfDoc.setCreator('FlowDrafter - Grey Development');
  pdfDoc.setProducer('FlowDrafter Irrigation Design Tool');
  pdfDoc.setCreationDate(new Date());

  // Calculate canvas dimensions based on DPI
  const scaleFactor = config.dpi / 72;
  const canvasWidth = Math.round(ARCH_D_WIDTH_IN * config.dpi);
  const canvasHeight = Math.round(ARCH_D_HEIGHT_IN * config.dpi);

  for (const sheet of sheets) {
    // Add page at ARCH D size
    const page = pdfDoc.addPage([ARCH_D_WIDTH_PT, ARCH_D_HEIGHT_PT]);

    // Convert SVG to rasterized image at specified DPI
    const imageBytes = await rasterizeSvg(
      sheet.svgContent,
      canvasWidth,
      canvasHeight,
      config.format,
      config.jpegQuality
    );

    // Embed image in PDF
    const image = config.format === 'png'
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

    // Draw image to fill page
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: ARCH_D_WIDTH_PT,
      height: ARCH_D_HEIGHT_PT,
    });
  }

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const dateStr = new Date().toISOString().split('T')[0];
  const dpiSuffix = config.dpi > 72 ? `_${config.dpi}dpi` : '';
  const fileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_IrrigationPlan${dpiSuffix}_${dateStr}.pdf`;
  saveAs(blob, fileName);
}

/**
 * Export with standard resolution (backward compatible)
 */
export async function exportPDFStandard(
  sheets: PlanSheet[],
  projectName: string
): Promise<void> {
  return exportPDF(sheets, projectName, EXPORT_PRESETS.standard);
}

/**
 * Export with HD resolution (300 DPI)
 */
export async function exportPDFHD(
  sheets: PlanSheet[],
  projectName: string
): Promise<void> {
  return exportPDF(sheets, projectName, EXPORT_PRESETS.printReady);
}

// ============================================================================
// SVG RASTERIZATION
// ============================================================================

/**
 * Convert SVG to rasterized image bytes
 */
async function rasterizeSvg(
  svgContent: string,
  width: number,
  height: number,
  format: 'png' | 'jpeg',
  jpegQuality?: number
): Promise<Uint8Array> {
  // Create canvas at target resolution
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Convert SVG to data URL
  const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));

  // Load and draw SVG to canvas
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      // Draw SVG scaled to canvas size
      ctx.drawImage(img, 0, 0, width, height);
      resolve();
    };
    img.onerror = (e) => reject(new Error(`Failed to load SVG: ${e}`));
    img.src = svgDataUrl;
  });

  // Convert to image format
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = format === 'jpeg' ? (jpegQuality ?? 0.92) : undefined;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  // Extract base64 data and convert to bytes
  const base64Data = dataUrl.split(',')[1];
  return Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Estimate file size for export configuration
 */
export function estimateFileSize(
  sheetCount: number,
  config: ExportConfig
): { minMB: number; maxMB: number } {
  const pixelsPerSheet = (ARCH_D_WIDTH_IN * config.dpi) * (ARCH_D_HEIGHT_IN * config.dpi);

  // Rough estimates based on typical compression
  let bytesPerPixel: number;
  if (config.format === 'jpeg') {
    bytesPerPixel = 0.3; // JPEG compresses well
  } else {
    // PNG varies widely based on content
    bytesPerPixel = 0.8;
  }

  const bytesPerSheet = pixelsPerSheet * bytesPerPixel;
  const totalBytes = bytesPerSheet * sheetCount;

  return {
    minMB: Math.round(totalBytes / (1024 * 1024) * 0.5),
    maxMB: Math.round(totalBytes / (1024 * 1024) * 1.5),
  };
}

/**
 * Get recommended export preset based on use case
 */
export function getRecommendedPreset(
  useCase: 'screen' | 'print-office' | 'print-professional'
): ExportConfig {
  switch (useCase) {
    case 'screen':
      return EXPORT_PRESETS.standard;
    case 'print-office':
      return EXPORT_PRESETS.highQuality;
    case 'print-professional':
      return EXPORT_PRESETS.printReady;
    default:
      return EXPORT_PRESETS.highQuality;
  }
}
