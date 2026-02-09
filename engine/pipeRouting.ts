import { SiteAnalysis, HeadPlacement, PipeSegment, Zone, ProjectInput } from '../types';
import { getMainlineSizeIn, needsMasterValve } from '../data/designRules';
import { VALVES } from '../data/materials';
import { centroid, distance } from '../utils/geometry';

let pipeCounter = 0;

function nextPipeId(): string {
  return `P-${++pipeCounter}`;
}

export interface RoutingResult {
  pipes: PipeSegment[];
  valves: Array<{
    id: string;
    x: number;
    y: number;
    model: string;
    size: number;
    type: 'zone' | 'master';
    zoneId: string | null;
  }>;
  poc: { x: number; y: number };
  backflow: { x: number; y: number; model: string; size: number };
  controller: { x: number; y: number; model: string };
  rainSensor: { x: number; y: number; model: string };
}

export function routePipes(
  siteAnalysis: SiteAnalysis,
  heads: HeadPlacement[],
  zones: Zone[],
  projectInput: ProjectInput
): RoutingResult {
  pipeCounter = 0;
  const pipes: PipeSegment[] = [];
  const valveResults: RoutingResult['valves'] = [];

  const pocPos = siteAnalysis.waterSourceLocation || { x: 5, y: siteAnalysis.propertyLengthFt / 2 };
  const totalGPM = zones.reduce((sum, z) => sum + z.totalGPM, 0);
  const mainlineSize = getMainlineSizeIn(totalGPM);

  const rpz = VALVES.find(v => v.id === '009m2-qt')!;
  const backflowPos = { x: pocPos.x + 5, y: pocPos.y };

  const controllerPos = siteAnalysis.controllerLocation || {
    x: siteAnalysis.nearestBuildingLocation.x,
    y: siteAnalysis.nearestBuildingLocation.y + 5,
  };

  if (needsMasterValve(totalGPM)) {
    const masterValve = VALVES.find(v => v.id === '200-peb')!;
    const mvPos = { x: backflowPos.x + 10, y: backflowPos.y };
    valveResults.push({
      id: 'MV-1',
      x: mvPos.x,
      y: mvPos.y,
      model: masterValve.model,
      size: masterValve.sizeIn,
      type: 'master',
      zoneId: null,
    });
    pipes.push({
      id: nextPipeId(),
      startX: backflowPos.x,
      startY: backflowPos.y,
      endX: mvPos.x,
      endY: mvPos.y,
      diameterIn: mainlineSize,
      material: 'sch40-pvc',
      type: 'mainline',
      zoneId: null,
    });
  }

  const mainlineStartX = needsMasterValve(totalGPM) ? backflowPos.x + 10 : backflowPos.x + 5;

  for (const zone of zones) {
    const zoneHeads = heads.filter(h => h.zoneId === zone.id);
    if (zoneHeads.length === 0) continue;

    const zoneCenter = centroid(zoneHeads.map(h => ({ x: h.x, y: h.y })));

    const valvePos = { x: zoneCenter.x - 3, y: zoneCenter.y - 3 };
    valveResults.push({
      id: `V-${zone.number}`,
      x: valvePos.x,
      y: valvePos.y,
      model: zone.valveModel,
      size: zone.valveSize,
      type: 'zone',
      zoneId: zone.id,
    });

    pipes.push({
      id: nextPipeId(),
      startX: mainlineStartX,
      startY: pocPos.y,
      endX: valvePos.x,
      endY: valvePos.y,
      diameterIn: mainlineSize,
      material: 'sch40-pvc',
      type: 'mainline',
      zoneId: null,
    });

    const lateralSize = zone.headType === 'rotor' ? 1 : 0.75;
    const lateralMaterial = 'class200-pvc' as const;

    for (const head of zoneHeads) {
      if (head.type === 'quick-coupler') continue;
      const nearestToValve = findNearestHead(head, zoneHeads, valvePos);
      pipes.push({
        id: nextPipeId(),
        startX: nearestToValve.x,
        startY: nearestToValve.y,
        endX: head.x,
        endY: head.y,
        diameterIn: lateralSize,
        material: lateralMaterial,
        type: zone.headType === 'drip' ? 'drip-supply' : 'lateral',
        zoneId: zone.id,
      });
    }
  }

  return {
    pipes,
    valves: valveResults,
    poc: pocPos,
    backflow: { ...backflowPos, model: rpz.model, size: mainlineSize },
    controller: { ...controllerPos, model: 'ESP-LXME2' },
    rainSensor: { x: controllerPos.x + 2, y: controllerPos.y - 2, model: 'Rain-Clik' },
  };
}

function findNearestHead(target: HeadPlacement, allHeads: HeadPlacement[], valvePos: { x: number; y: number }): { x: number; y: number } {
  let nearest = valvePos;
  let minDist = distance(target, valvePos);
  for (const h of allHeads) {
    if (h.id === target.id) continue;
    const d = distance(target, h);
    if (d < minDist) {
      minDist = d;
      nearest = { x: h.x, y: h.y };
    }
  }
  return nearest;
}
