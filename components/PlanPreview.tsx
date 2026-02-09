import React, { useState, useRef, useEffect } from 'react';
import { PlanSheet } from '../types';

interface Props {
  sheets: PlanSheet[];
  activeSheet: number;
  onSheetChange: (index: number) => void;
}

const PlanPreview: React.FC<Props> = ({ sheets, activeSheet, onSheetChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);

  const sheet = sheets[activeSheet];
  if (!sheet) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Plan Preview</h2>
        <div className="flex items-center gap-4">
          {/* Sheet tabs */}
          <div className="flex gap-1">
            {sheets.map((s, i) => (
              <button
                key={s.sheetNumber}
                onClick={() => onSheetChange(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  i === activeSheet
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.sheetNumber}: {s.title}
              </button>
            ))}
          </div>
          {/* Zoom controls */}
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="w-7 h-7 bg-gray-100 rounded-lg font-bold hover:bg-gray-200">-</button>
            <span className="text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="w-7 h-7 bg-gray-100 rounded-lg font-bold hover:bg-gray-200">+</button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-gray-200 rounded-xl border border-gray-300 overflow-auto"
        style={{ maxHeight: '70vh' }}
      >
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          dangerouslySetInnerHTML={{ __html: sheet.svgContent }}
        />
      </div>
    </div>
  );
};

export default PlanPreview;
