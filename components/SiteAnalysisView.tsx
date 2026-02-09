import React from 'react';
import { SiteAnalysis } from '../types';

interface Props {
  analysis: SiteAnalysis;
  onContinue: () => void;
}

const SiteAnalysisView: React.FC<Props> = ({ analysis, onContinue }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Site Analysis Complete</h2>
        <p className="text-gray-500 mt-1">Review the detected zones and features before generating the design.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Irrigable Area" value={`${analysis.totalIrrigableSqFt.toLocaleString()} sq ft`} />
        <StatCard label="Property Dimensions" value={`${Math.round(analysis.propertyWidthFt)}' x ${Math.round(analysis.propertyLengthFt)}'`} />
        <StatCard label="Estimated Acreage" value={`${((analysis.propertyWidthFt * analysis.propertyLengthFt) / 43560).toFixed(2)} acres`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Turf Zones */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Turf Zones ({analysis.turfZones.length})
          </h3>
          {analysis.turfZones.length > 0 ? (
            <div className="space-y-2">
              {analysis.turfZones.map(z => (
                <div key={z.id} className="flex justify-between text-sm bg-green-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-700">{z.id}: {z.shape}, {z.exposure}</span>
                  <span className="text-gray-500">{Math.round(z.widthFt)}' x {Math.round(z.lengthFt)}' ({z.areaFt2.toLocaleString()} sf)</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No turf zones detected</p>
          )}
        </div>

        {/* Bed Zones */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            Bed / Planter Zones ({analysis.bedZones.length})
          </h3>
          {analysis.bedZones.length > 0 ? (
            <div className="space-y-2">
              {analysis.bedZones.map(z => (
                <div key={z.id} className="flex justify-between text-sm bg-amber-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-700">{z.id}: {z.type}, {z.exposure}</span>
                  <span className="text-gray-500">{z.areaFt2.toLocaleString()} sf</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No bed zones detected</p>
          )}
        </div>

        {/* Hardscapes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
            Hardscapes ({analysis.hardscapeBoundaries.length})
          </h3>
          {analysis.hardscapeBoundaries.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.hardscapeBoundaries.map((h, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                  {h.type}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No hardscapes detected</p>
          )}
        </div>

        {/* Structures & Features */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Structures & Features
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Structures: {analysis.structures.length}</p>
            <p>Narrow Strips: {analysis.narrowStrips.length}</p>
            <p>Tree Canopies: {analysis.treeCanopyAreas.length}</p>
            <p>Slopes: {analysis.slopeIndicators.length}</p>
            <p>Water Source: {analysis.waterSourceLocation ? 'Detected' : 'Not detected'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all"
        >
          Generate Irrigation Design
        </button>
      </div>
    </div>
  );
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default SiteAnalysisView;
