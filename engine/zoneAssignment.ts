import { HeadPlacement, Zone } from '../types';
import { getMaxGPMForLateral, getLateralSizeIn } from '../data/designRules';
import { selectValveForZone } from '../data/materials';
import { getZoneColor } from '../data/zoneColors';

export function assignZones(heads: HeadPlacement[]): { zones: Zone[]; updatedHeads: HeadPlacement[] } {
  const groups = groupHeadsByType(heads);
  const zones: Zone[] = [];
  let zoneNumber = 1;
  const updatedHeads = [...heads];

  for (const [groupKey, groupHeads] of Object.entries(groups)) {
    const headType = groupHeads[0].type;
    if (headType === 'quick-coupler') continue;

    const lateralSize = getLateralSizeIn(headType as any);
    const maxGPM = getMaxGPMForLateral(lateralSize);

    let currentZoneHeads: HeadPlacement[] = [];
    let currentGPM = 0;

    for (const head of groupHeads) {
      if (currentGPM + head.gpm > maxGPM && currentZoneHeads.length > 0) {
        const zone = createZone(zoneNumber, currentZoneHeads, headType as any);
        zones.push(zone);
        assignHeadsToZone(updatedHeads, currentZoneHeads, zone.id);
        zoneNumber++;
        currentZoneHeads = [];
        currentGPM = 0;
      }
      currentZoneHeads.push(head);
      currentGPM += head.gpm;
    }

    if (currentZoneHeads.length > 0) {
      const zone = createZone(zoneNumber, currentZoneHeads, headType as any);
      zones.push(zone);
      assignHeadsToZone(updatedHeads, currentZoneHeads, zone.id);
      zoneNumber++;
    }
  }

  return { zones, updatedHeads };
}

function groupHeadsByType(heads: HeadPlacement[]): Record<string, HeadPlacement[]> {
  const groups: Record<string, HeadPlacement[]> = {};
  for (const head of heads) {
    const key = head.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(head);
  }
  return groups;
}

function createZone(
  number: number,
  heads: HeadPlacement[],
  headType: 'rotor' | 'spray' | 'rotary-nozzle' | 'drip' | 'strip'
): Zone {
  const totalGPM = heads.reduce((sum, h) => sum + h.gpm, 0);
  const totalArea = estimateZoneArea(heads);
  const precipRate = totalArea > 0 ? (totalGPM * 96.25) / totalArea : 0;
  const runtime = precipRate > 0 ? (0.5 / precipRate) * 60 : 0;
  const valve = selectValveForZone(totalGPM);

  return {
    id: `Z-${number}`,
    number,
    headType,
    exposure: 'full-sun',
    heads: heads.map(h => h.id),
    totalGPM: Math.round(totalGPM * 10) / 10,
    precipRateInPerHr: Math.round(precipRate * 100) / 100,
    runtimeMinutes: Math.round(runtime),
    color: getZoneColor(number - 1),
    valveModel: valve.model,
    valveSize: valve.sizeIn,
  };
}

function estimateZoneArea(heads: HeadPlacement[]): number {
  if (heads.length === 0) return 0;
  if (heads[0].type === 'drip') return heads.reduce((sum, h) => sum + Math.PI * 100, 0);
  const avgRadius = heads.reduce((sum, h) => sum + h.radiusFt, 0) / heads.length;
  return heads.length * avgRadius * avgRadius;
}

function assignHeadsToZone(allHeads: HeadPlacement[], zoneHeads: HeadPlacement[], zoneId: string): void {
  for (const zh of zoneHeads) {
    const idx = allHeads.findIndex(h => h.id === zh.id);
    if (idx >= 0) allHeads[idx] = { ...allHeads[idx], zoneId };
  }
}
