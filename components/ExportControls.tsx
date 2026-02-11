import React, { useState } from 'react';
import { PlanSheet, IrrigationDesign } from '../types';
import { exportPDF, EXPORT_PRESETS, ExportConfig, estimateFileSize } from '../services/pdfExportService';

type ExportQuality = 'standard' | 'highQuality' | 'printReady' | 'printReadyCompressed';

const QUALITY_OPTIONS: Array<{ value: ExportQuality; label: string; description: string }> = [
  { value: 'standard', label: 'Screen (72 DPI)', description: 'Fast, smaller file ~2-5 MB' },
  { value: 'highQuality', label: 'Office Print (150 DPI)', description: 'Good quality ~8-15 MB' },
  { value: 'printReady', label: 'Professional (300 DPI)', description: 'Print-ready HD ~20-40 MB' },
  { value: 'printReadyCompressed', label: 'Professional Compressed', description: 'HD JPEG ~10-20 MB' },
];

interface Props {
  sheets: PlanSheet[];
  design: IrrigationDesign;
  projectName: string;
  exporting: boolean;
  onExportStart: () => void;
  onExportEnd: () => void;
}

const ExportControls: React.FC<Props> = ({ sheets, design, projectName, exporting, onExportStart, onExportEnd }) => {
  const [selectedSheets, setSelectedSheets] = useState<Set<number>>(new Set([0, 1, 2]));
  const [quality, setQuality] = useState<ExportQuality>('printReady');

  const toggleSheet = (index: number) => {
    setSelectedSheets(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleExport = async () => {
    onExportStart();
    try {
      const sheetsToExport = sheets.filter((_, i) => selectedSheets.has(i));
      const config = EXPORT_PRESETS[quality];
      await exportPDF(sheetsToExport, projectName, config);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      onExportEnd();
    }
  };

  const fileSizeEstimate = estimateFileSize(selectedSheets.size, EXPORT_PRESETS[quality]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h3 className="font-bold text-gray-900">Export Plan Set</h3>

      <div className="space-y-2">
        {sheets.map((sheet, i) => (
          <label key={sheet.sheetNumber} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSheets.has(i)}
              onChange={() => toggleSheet(i)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              <span className="font-bold">{sheet.sheetNumber}</span> - {sheet.title}
            </span>
          </label>
        ))}
      </div>

      {/* Quality Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Export Quality</label>
        <div className="space-y-1">
          {QUALITY_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="quality"
                value={option.value}
                checked={quality === option.value}
                onChange={() => setQuality(option.value)}
                className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-800">{option.label}</span>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
        <p>Format: ARCH D (24" x 36") PDF</p>
        <p>System: {design.totalZones} zones, {design.totalSystemGPM} GPM total</p>
        <p>Heads: {design.heads.length} | Pipe segments: {design.pipes.length}</p>
        <p className="font-medium text-gray-700">Est. file size: {fileSizeEstimate.minMB}-{fileSizeEstimate.maxMB} MB</p>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting || selectedSheets.size === 0}
        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
      >
        {exporting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF Plan Set ({selectedSheets.size} sheets)</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ExportControls;
