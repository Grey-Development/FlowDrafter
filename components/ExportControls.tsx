import React, { useState } from 'react';
import { PlanSheet, IrrigationDesign } from '../types';
import { exportPDF } from '../services/pdfExportService';

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
      await exportPDF(sheetsToExport, projectName);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      onExportEnd();
    }
  };

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

      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
        <p>Format: ARCH D (24" x 36") PDF</p>
        <p>System: {design.totalZones} zones, {design.totalSystemGPM} GPM total</p>
        <p>Heads: {design.heads.length} | Pipe segments: {design.pipes.length}</p>
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
