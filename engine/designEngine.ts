import { SiteAnalysis, ProjectInput, IrrigationDesign } from '../types';
import { placeAllHeads } from './headPlacement';
import { assignZones } from './zoneAssignment';
import { routePipes } from './pipeRouting';
import { calculateMaterials } from './materialCalc';

export function generateIrrigationDesign(
  siteAnalysis: SiteAnalysis,
  projectInput: ProjectInput
): IrrigationDesign {
  const rawHeads = placeAllHeads(siteAnalysis, projectInput);
  const { zones, updatedHeads } = assignZones(rawHeads);
  const routing = routePipes(siteAnalysis, updatedHeads, zones, projectInput);

  const totalSystemGPM = zones.reduce((sum, z) => sum + z.totalGPM, 0);

  const partialDesign = {
    heads: updatedHeads,
    pipes: routing.pipes,
    zones,
    valves: routing.valves,
    controller: routing.controller,
    backflow: routing.backflow,
    poc: routing.poc,
    rainSensor: routing.rainSensor,
    zoneSchedule: zones,
    totalSystemGPM: Math.round(totalSystemGPM * 10) / 10,
    totalZones: zones.length,
  };

  const materialSchedule = calculateMaterials(partialDesign as any);

  return {
    ...partialDesign,
    materialSchedule,
  };
}
