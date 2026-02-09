import { HeadPlacement, PipeSegment, Zone, MaterialScheduleItem, IrrigationDesign } from '../types';
import { SPRINKLER_HEADS, VALVES, CONTROLLERS, SENSORS, SWING_JOINT, VALVE_BOXES, WIRE, DRIP_KIT } from '../data/materials';
import { needsMasterValve } from '../data/designRules';
import { distance } from '../utils/geometry';

export function calculateMaterials(design: Omit<IrrigationDesign, 'materialSchedule'>): MaterialScheduleItem[] {
  const items: MaterialScheduleItem[] = [];

  const headCounts: Record<string, number> = {};
  for (const head of design.heads) {
    if (head.type === 'quick-coupler') {
      headCounts['44RC'] = (headCounts['44RC'] || 0) + 1;
      continue;
    }
    headCounts[head.model] = (headCounts[head.model] || 0) + 1;
  }

  for (const [model, count] of Object.entries(headCounts)) {
    const spec = SPRINKLER_HEADS.find(h => h.model === model);
    items.push({
      item: spec?.name || model,
      manufacturer: spec?.manufacturer || '',
      model,
      quantity: count,
      unit: 'EA',
    });
  }

  const zoneValveCount = design.valves.filter(v => v.type === 'zone').length;
  const valve1in = design.valves.filter(v => v.type === 'zone' && v.size === 1).length;
  const valve1_5in = design.valves.filter(v => v.type === 'zone' && v.size === 1.5).length;

  if (valve1in > 0) {
    const spec = VALVES.find(v => v.id === 'peb-100')!;
    items.push({ item: spec.name, manufacturer: spec.manufacturer, model: spec.model, quantity: valve1in, unit: 'EA' });
  }
  if (valve1_5in > 0) {
    const spec = VALVES.find(v => v.id === 'peb-150')!;
    items.push({ item: spec.name, manufacturer: spec.manufacturer, model: spec.model, quantity: valve1_5in, unit: 'EA' });
  }

  if (needsMasterValve(design.totalSystemGPM)) {
    const spec = VALVES.find(v => v.id === '200-peb')!;
    items.push({ item: spec.name, manufacturer: spec.manufacturer, model: spec.model, quantity: 1, unit: 'EA' });
  }

  const rpzSpec = VALVES.find(v => v.id === '009m2-qt')!;
  items.push({ item: rpzSpec.name, manufacturer: rpzSpec.manufacturer, model: rpzSpec.model, quantity: 1, unit: 'EA' });

  const ctrlSpec = CONTROLLERS[0];
  items.push({ item: ctrlSpec.name, manufacturer: ctrlSpec.manufacturer, model: ctrlSpec.model, quantity: 1, unit: 'EA' });

  const rainSpec = SENSORS.find(s => s.id === 'rain-clik')!;
  items.push({ item: rainSpec.name, manufacturer: rainSpec.manufacturer, model: rainSpec.model, quantity: 1, unit: 'EA' });

  const pipeLengths: Record<string, number> = {};
  for (const pipe of design.pipes) {
    const len = distance({ x: pipe.startX, y: pipe.startY }, { x: pipe.endX, y: pipe.endY });
    const key = `${pipe.diameterIn}in-${pipe.material}`;
    pipeLengths[key] = (pipeLengths[key] || 0) + len;
  }

  for (const [key, length] of Object.entries(pipeLengths)) {
    const [sizeStr, material] = key.split('-');
    const size = parseFloat(sizeStr);
    const matName = material === 'sch40' ? 'Sch. 40 PVC' : 'Class 200 PVC';
    items.push({
      item: `${matName} - ${size}" pipe`,
      manufacturer: '',
      model: '',
      quantity: Math.ceil(length),
      unit: 'LF',
    });
  }

  const sprinklerHeadCount = design.heads.filter(h => h.type !== 'quick-coupler' && h.type !== 'drip').length;
  items.push({
    item: SWING_JOINT.name,
    manufacturer: SWING_JOINT.manufacturer,
    model: SWING_JOINT.model,
    quantity: sprinklerHeadCount,
    unit: 'EA',
  });

  const valveBoxCount = Math.ceil(zoneValveCount / 4);
  items.push({
    item: VALVE_BOXES.jumbo.name,
    manufacturer: VALVE_BOXES.jumbo.manufacturer,
    model: VALVE_BOXES.jumbo.model,
    quantity: valveBoxCount,
    unit: 'EA',
  });

  const totalWireRun = design.pipes.filter(p => p.type === 'mainline').reduce((sum, p) => {
    return sum + distance({ x: p.startX, y: p.startY }, { x: p.endX, y: p.endY });
  }, 0);

  items.push({ item: WIRE.common.name, manufacturer: '', model: WIRE.common.spec, quantity: Math.ceil(totalWireRun), unit: 'LF' });
  items.push({ item: WIRE.zone.name, manufacturer: '', model: WIRE.zone.spec, quantity: Math.ceil(totalWireRun * design.totalZones), unit: 'LF' });

  const dripZones = design.zones.filter(z => z.headType === 'drip');
  if (dripZones.length > 0) {
    items.push({
      item: DRIP_KIT.name,
      manufacturer: DRIP_KIT.manufacturer,
      model: DRIP_KIT.model,
      quantity: dripZones.length,
      unit: 'EA',
    });
  }

  return items;
}
