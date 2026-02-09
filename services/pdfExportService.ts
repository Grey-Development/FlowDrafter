import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { PlanSheet } from '../types';
import { ARCH_D_WIDTH_PT, ARCH_D_HEIGHT_PT } from '../utils/scaling';

export async function exportPDF(
  sheets: PlanSheet[],
  projectName: string
): Promise<void> {
  const pdfDoc = await PDFDocument.create();

  for (const sheet of sheets) {
    const page = pdfDoc.addPage([ARCH_D_WIDTH_PT, ARCH_D_HEIGHT_PT]);

    const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(sheet.svgContent)));

    const canvas = document.createElement('canvas');
    canvas.width = ARCH_D_WIDTH_PT;
    canvas.height = ARCH_D_HEIGHT_PT;
    const ctx = canvas.getContext('2d')!;

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = reject;
      img.src = svgDataUrl;
    });

    const pngDataUrl = canvas.toDataURL('image/png');
    const pngData = pngDataUrl.split(',')[1];
    const pngBytes = Uint8Array.from(atob(pngData), c => c.charCodeAt(0));
    const pngImage = await pdfDoc.embedPng(pngBytes);

    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: ARCH_D_WIDTH_PT,
      height: ARCH_D_HEIGHT_PT,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_IrrigationPlan_${dateStr}.pdf`;
  saveAs(blob, fileName);
}
