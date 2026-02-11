import React, { useState, useRef, useCallback } from 'react';
import { ImagePoint, ImageMarkup, ScaleReference } from '../types';

type MarkupMode = 'scale1' | 'scale2' | 'scaleConfirm' | 'controller' | 'waterSource' | 'irrigation' | 'none';

interface Props {
  imageUrl: string;
  markup: ImageMarkup;
  onMarkupChange: (markup: ImageMarkup) => void;
}

const ImageMarkupComponent: React.FC<Props> = ({ imageUrl, markup, onMarkupChange }) => {
  const [mode, setMode] = useState<MarkupMode>('none');
  const [scalePoint1, setScalePoint1] = useState<ImagePoint | null>(markup.scaleReference?.point1 || null);
  const [scalePoint2, setScalePoint2] = useState<ImagePoint | null>(markup.scaleReference?.point2 || null);
  const [scaleDistance, setScaleDistance] = useState<number>(markup.scaleReference?.distanceFt || 0);
  const [currentPolygon, setCurrentPolygon] = useState<ImagePoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getClickPosition = useCallback((e: React.MouseEvent<HTMLDivElement>): ImagePoint => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const point = getClickPosition(e);

    switch (mode) {
      case 'scale1':
        setScalePoint1(point);
        setMode('scale2');
        break;

      case 'scale2':
        if (scalePoint1) {
          setScalePoint2(point);
          setMode('scaleConfirm');
        }
        break;

      case 'controller':
        onMarkupChange({ ...markup, controllerLocation: point });
        setMode('none');
        break;

      case 'waterSource':
        onMarkupChange({ ...markup, waterSourceLocation: point });
        setMode('none');
        break;

      case 'irrigation':
        // Check if clicking near the first point to close the polygon
        if (currentPolygon.length >= 3) {
          const firstPoint = currentPolygon[0];
          const distance = Math.sqrt(
            Math.pow(point.x - firstPoint.x, 2) + Math.pow(point.y - firstPoint.y, 2)
          );
          // If within 2% of image size, close the polygon
          if (distance < 0.02) {
            // Close the polygon
            const areas = markup.irrigationAreas || [];
            onMarkupChange({ ...markup, irrigationAreas: [...areas, currentPolygon] });
            setCurrentPolygon([]);
            setMode('none');
            return;
          }
        }
        setCurrentPolygon([...currentPolygon, point]);
        break;
    }
  }, [mode, scalePoint1, scaleDistance, markup, currentPolygon, getClickPosition, onMarkupChange]);

  const finishPolygon = () => {
    if (currentPolygon.length >= 3) {
      const areas = markup.irrigationAreas || [];
      onMarkupChange({ ...markup, irrigationAreas: [...areas, currentPolygon] });
    }
    setCurrentPolygon([]);
    setMode('none');
  };

  const clearIrrigationAreas = () => {
    onMarkupChange({ ...markup, irrigationAreas: [] });
    setCurrentPolygon([]);
  };

  const startScaleMode = () => {
    setScalePoint1(null);
    setScalePoint2(null);
    setScaleDistance(0);
    setMode('scale1');
  };

  const confirmScale = () => {
    if (scalePoint1 && scalePoint2 && scaleDistance > 0) {
      onMarkupChange({
        ...markup,
        scaleReference: {
          point1: scalePoint1,
          point2: scalePoint2,
          distanceFt: scaleDistance,
        },
      });
      setMode('none');
    }
  };

  const renderMarker = (point: ImagePoint, color: string, label: string) => (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
    >
      <div className={`w-4 h-4 rounded-full border-2 ${color} flex items-center justify-center bg-white shadow`}>
        <span className="text-[9px] font-bold leading-none">{label}</span>
      </div>
    </div>
  );

  const renderScaleLine = () => {
    if (!markup.scaleReference) return null;
    const { point1, point2, distanceFt } = markup.scaleReference;

    return (
      <>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1={`${point1.x * 100}%`}
            y1={`${point1.y * 100}%`}
            x2={`${point2.x * 100}%`}
            y2={`${point2.y * 100}%`}
            stroke="#3B82F6"
            strokeWidth="3"
            strokeDasharray="8 4"
          />
        </svg>
        {renderMarker(point1, 'border-blue-500 text-blue-600', '1')}
        {renderMarker(point2, 'border-blue-500 text-blue-600', '2')}
        <div
          className="absolute bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{
            left: `${((point1.x + point2.x) / 2) * 100}%`,
            top: `${((point1.y + point2.y) / 2) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {distanceFt} ft
        </div>
      </>
    );
  };

  const renderPolygons = () => {
    const areas = markup.irrigationAreas || [];
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {areas.map((polygon, i) => (
          <g key={i}>
            <polygon
              points={polygon.map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
              fill="rgba(34, 197, 94, 0.25)"
              stroke="#16A34A"
              strokeWidth="0.5"
            />
            {/* Vertex markers for completed polygons */}
            {polygon.map((p, j) => (
              <circle
                key={j}
                cx={p.x * 100}
                cy={p.y * 100}
                r="0.8"
                fill="#16A34A"
                stroke="#fff"
                strokeWidth="0.2"
              />
            ))}
          </g>
        ))}
        {currentPolygon.length > 0 && (
          <>
            {/* Use polyline during drawing to show connecting lines */}
            {currentPolygon.length >= 2 && (
              <polyline
                points={currentPolygon.map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
                fill="none"
                stroke="#22C55E"
                strokeWidth="0.5"
                strokeDasharray="1 0.5"
              />
            )}
            {/* Show filled polygon preview only when we have 3+ points */}
            {currentPolygon.length >= 3 && (
              <polygon
                points={currentPolygon.map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
                fill="rgba(34, 197, 94, 0.15)"
                stroke="none"
              />
            )}
            {/* Vertex markers */}
            {currentPolygon.map((p, i) => (
              <circle
                key={i}
                cx={p.x * 100}
                cy={p.y * 100}
                r={i === 0 && currentPolygon.length >= 3 ? 1.2 : 0.8}
                fill={i === 0 && currentPolygon.length >= 3 ? '#16A34A' : '#22C55E'}
                stroke="#fff"
                strokeWidth="0.3"
              />
            ))}
          </>
        )}
      </svg>
    );
  };

  const getModeInstructions = () => {
    switch (mode) {
      case 'scale1': return 'Click the FIRST point of a known distance';
      case 'scale2': return 'Click the SECOND point of the known distance';
      case 'scaleConfirm': return 'Enter the distance between the two points and click Confirm';
      case 'controller': return 'Click where the controller should be located';
      case 'waterSource': return 'Click where the water source/POC is located';
      case 'irrigation': return currentPolygon.length >= 3
        ? 'Click near the first point (highlighted) to close the shape, or continue adding points'
        : 'Click to place points. Need at least 3 points to create an area';
      default: return 'Select a tool below to mark up the image';
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className={`p-3 rounded-lg text-sm font-medium ${mode !== 'none' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
        {getModeInstructions()}
      </div>

      {/* Scale distance input (shown when in scale mode) */}
      {(mode === 'scale1' || mode === 'scale2' || mode === 'scaleConfirm') && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg flex-wrap">
          <label className="text-sm font-medium text-blue-800">Distance between points:</label>
          <input
            type="number"
            value={scaleDistance || ''}
            onChange={e => setScaleDistance(parseFloat(e.target.value) || 0)}
            placeholder="e.g., 20"
            className="w-24 px-3 py-1.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-blue-700">feet</span>
          {mode === 'scaleConfirm' && (
            <button
              type="button"
              onClick={confirmScale}
              disabled={scaleDistance <= 0}
              className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirm Scale
            </button>
          )}
        </div>
      )}

      {/* Image with markers */}
      <div
        ref={containerRef}
        className={`relative cursor-crosshair border-2 rounded-xl overflow-hidden ${mode !== 'none' ? 'border-blue-400' : 'border-gray-300'}`}
        onClick={handleImageClick}
      >
        <img src={imageUrl} alt="Site" className="w-full h-auto" />

        {/* Render scale line */}
        {renderScaleLine()}

        {/* Render temporary scale points during scale mode */}
        {(mode === 'scale2' || mode === 'scaleConfirm') && scalePoint1 && renderMarker(scalePoint1, 'border-blue-500 text-blue-600', '1')}
        {mode === 'scaleConfirm' && scalePoint2 && (
          <>
            {renderMarker(scalePoint2, 'border-blue-500 text-blue-600', '2')}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1={`${scalePoint1!.x * 100}%`}
                y1={`${scalePoint1!.y * 100}%`}
                x2={`${scalePoint2.x * 100}%`}
                y2={`${scalePoint2.y * 100}%`}
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
            </svg>
          </>
        )}

        {/* Render controller marker */}
        {markup.controllerLocation && renderMarker(markup.controllerLocation, 'border-purple-500 text-purple-600', 'C')}

        {/* Render water source marker */}
        {markup.waterSourceLocation && renderMarker(markup.waterSourceLocation, 'border-cyan-500 text-cyan-600', 'W')}

        {/* Render irrigation polygons */}
        {renderPolygons()}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startScaleMode}
          className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
            mode === 'scale1' || mode === 'scale2' || mode === 'scaleConfirm'
              ? 'bg-blue-600 text-white'
              : markup.scaleReference
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {markup.scaleReference ? '✓ Scale Set' : 'Set Scale (Required)'}
        </button>

        <button
          type="button"
          onClick={() => setMode('controller')}
          className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
            mode === 'controller'
              ? 'bg-purple-600 text-white'
              : markup.controllerLocation
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {markup.controllerLocation ? '✓ Controller' : 'Mark Controller'}
        </button>

        <button
          type="button"
          onClick={() => setMode('waterSource')}
          className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
            mode === 'waterSource'
              ? 'bg-cyan-600 text-white'
              : markup.waterSourceLocation
                ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {markup.waterSourceLocation ? '✓ Water Source' : 'Mark Water Source'}
        </button>

        <button
          type="button"
          onClick={() => setMode('irrigation')}
          className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
            mode === 'irrigation'
              ? 'bg-green-600 text-white'
              : (markup.irrigationAreas?.length || 0) > 0
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {(markup.irrigationAreas?.length || 0) > 0 ? `✓ ${markup.irrigationAreas?.length} Area(s)` : 'Draw Irrigation Area'}
        </button>

        {mode === 'irrigation' && currentPolygon.length >= 3 && (
          <button
            type="button"
            onClick={finishPolygon}
            className="px-3 py-2 text-sm rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
          >
            Done Drawing
          </button>
        )}

        {(markup.irrigationAreas?.length || 0) > 0 && (
          <button
            type="button"
            onClick={clearIrrigationAreas}
            className="px-3 py-2 text-sm rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200"
          >
            Clear Areas
          </button>
        )}

        {mode !== 'none' && (
          <button
            type="button"
            onClick={() => { setMode('none'); setCurrentPolygon([]); }}
            className="px-3 py-2 text-sm rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border-2 border-blue-500"></span> Scale Reference
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border-2 border-purple-500"></span> Controller (C)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border-2 border-cyan-500"></span> Water Source (W)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500"></span> Irrigation Area
        </span>
      </div>
    </div>
  );
};

export default ImageMarkupComponent;
