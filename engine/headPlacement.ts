import { SiteAnalysis, IrrigableZone, HeadPlacement, ProjectInput } from '../types';
import { selectHeadForZone, SPRINKLER_HEADS } from '../data/materials';
import { generateGridPoints, isPointInPolygon, boundingBox } from '../utils/geometry';

let headCounter = 0;

function nextHeadId(): string {
  return `H-${++headCounter}`;
}

function placeHeadsInZone(
  zone: IrrigableZone,
  isAthleticField: boolean
): HeadPlacement[] {
  const maxDim = Math.max(zone.widthFt, zone.lengthFt);
  const headSpec = selectHeadForZone(zone.type, maxDim, isAthleticField);

  if (headSpec.category === 'drip') {
    return placeDripZone(zone, headSpec);
  }

  const spacing = headSpec.defaultRadiusFt;
  const pattern = isAthleticField ? 'triangular' : 'square';

  const bb = zone.boundaryPoints.length > 0
    ? boundingBox(zone.boundaryPoints)
    : { minX: zone.centerX - zone.widthFt / 2, minY: zone.centerY - zone.lengthFt / 2, maxX: zone.centerX + zone.widthFt / 2, maxY: zone.centerY + zone.lengthFt / 2, width: zone.widthFt, height: zone.lengthFt };

  const gridPoints = generateGridPoints(
    bb.minX, bb.minY,
    bb.width, bb.height,
    spacing, spacing,
    pattern
  );

  const heads: HeadPlacement[] = [];
  for (const pt of gridPoints) {
    const inBounds = zone.boundaryPoints.length >= 3
      ? isPointInPolygon(pt, zone.boundaryPoints)
      : true;
    if (inBounds) {
      const arc = determineArc(pt, bb);
      heads.push({
        id: nextHeadId(),
        x: pt.x,
        y: pt.y,
        type: headSpec.category === 'rotary-nozzle' ? 'rotary-nozzle' : headSpec.category === 'strip' ? 'strip' : headSpec.category === 'rotor' ? 'rotor' : 'spray',
        model: headSpec.model,
        manufacturer: headSpec.manufacturer,
        arc,
        radiusFt: headSpec.defaultRadiusFt,
        gpm: adjustGPMForArc(headSpec.gpmAtDefaultRadius, arc),
        psi: headSpec.psi,
        nozzle: headSpec.nozzle,
        zoneId: '',
      });
    }
  }
  return heads;
}

function placeDripZone(zone: IrrigableZone, headSpec: typeof SPRINKLER_HEADS[0]): HeadPlacement[] {
  return [{
    id: nextHeadId(),
    x: zone.centerX,
    y: zone.centerY,
    type: 'drip',
    model: headSpec.model,
    manufacturer: headSpec.manufacturer,
    arc: 0,
    radiusFt: 0,
    gpm: (zone.areaFt2 / 144) * 0.9,
    psi: 30,
    nozzle: headSpec.nozzle,
    zoneId: '',
  }];
}

function determineArc(pt: { x: number; y: number }, bb: { minX: number; minY: number; maxX: number; maxY: number }): number {
  const edgeThreshold = 2;
  const atLeft = Math.abs(pt.x - bb.minX) < edgeThreshold;
  const atRight = Math.abs(pt.x - bb.maxX) < edgeThreshold;
  const atTop = Math.abs(pt.y - bb.minY) < edgeThreshold;
  const atBottom = Math.abs(pt.y - bb.maxY) < edgeThreshold;

  const edgeCount = [atLeft, atRight, atTop, atBottom].filter(Boolean).length;
  if (edgeCount >= 2) return 90;
  if (edgeCount === 1) return 180;
  return 360;
}

function adjustGPMForArc(fullCircleGPM: number, arc: number): number {
  return fullCircleGPM * (arc / 360);
}

export function placeAllHeads(
  siteAnalysis: SiteAnalysis,
  projectInput: ProjectInput
): HeadPlacement[] {
  headCounter = 0;
  const isAthletic = projectInput.applicationType === 'athletic-field';
  const allHeads: HeadPlacement[] = [];

  for (const zone of siteAnalysis.turfZones) {
    allHeads.push(...placeHeadsInZone(zone, isAthletic));
  }
  for (const zone of siteAnalysis.bedZones) {
    allHeads.push(...placeHeadsInZone(zone, false));
  }
  for (const zone of siteAnalysis.narrowStrips) {
    allHeads.push(...placeHeadsInZone(zone, false));
  }

  if (isAthletic) {
    const propWidth = siteAnalysis.propertyWidthFt;
    const propLength = siteAnalysis.propertyLengthFt;
    const qcPositions = [
      { x: propWidth / 2, y: propLength / 2 },
      { x: propWidth / 2, y: propLength * 0.25 },
      { x: propWidth / 2, y: propLength * 0.75 },
    ];
    for (const pos of qcPositions) {
      const qc = SPRINKLER_HEADS.find(h => h.id === '44rc')!;
      allHeads.push({
        id: nextHeadId(),
        x: pos.x,
        y: pos.y,
        type: 'quick-coupler',
        model: qc.model,
        manufacturer: qc.manufacturer,
        arc: 0,
        radiusFt: 0,
        gpm: 0,
        psi: 0,
        nozzle: '',
        zoneId: '',
      });
    }
  }

  return allHeads;
}
