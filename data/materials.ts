export interface HeadSpec {
  id: string;
  category: 'rotor' | 'spray' | 'rotary-nozzle' | 'strip' | 'drip' | 'quick-coupler';
  name: string;
  manufacturer: string;
  model: string;
  application: string;
  minRadiusFt: number;
  maxRadiusFt: number;
  defaultRadiusFt: number;
  arcAdjustable: boolean;
  defaultArc: number;
  gpmAtDefaultRadius: number;
  psi: number;
  nozzle: string;
  popUpHeight?: number;
  features: string[];
  planLabel: string;
}

export interface ValveSpec {
  id: string;
  category: 'zone' | 'master' | 'backflow' | 'quick-coupler';
  name: string;
  manufacturer: string;
  model: string;
  application: string;
  sizeIn: number;
  features: string[];
}

export interface ControllerSpec {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  application: string;
  stations: string;
  features: string[];
}

export interface SensorSpec {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  type: 'rain' | 'soil-moisture';
  features: string[];
}

export interface PipeSpec {
  id: string;
  name: string;
  material: string;
  sizeIn: number;
  application: string;
  type: 'mainline' | 'lateral' | 'swing-joint' | 'drip-supply';
  maxGPM: number;
  maxVelocityFPS: number;
}

export const SPRINKLER_HEADS: HeadSpec[] = [
  {
    id: 'i-40-04-ss',
    category: 'rotor',
    name: 'Rotor - Large Turf',
    manufacturer: 'Hunter',
    model: 'I-40-04-SS',
    application: 'Open turf, athletic fields',
    minRadiusFt: 38,
    maxRadiusFt: 72,
    defaultRadiusFt: 42,
    arcAdjustable: true,
    defaultArc: 360,
    gpmAtDefaultRadius: 4.2,
    psi: 45,
    nozzle: '#6.0',
    popUpHeight: 4,
    features: ['Stainless riser', 'Adjustable arc'],
    planLabel: 'RTR',
  },
  {
    id: '5004-pc-sam',
    category: 'rotor',
    name: 'Rotor - Medium Turf',
    manufacturer: 'Rain Bird',
    model: '5004-PC-SAM',
    application: 'Medium turf panels, medians',
    minRadiusFt: 25,
    maxRadiusFt: 50,
    defaultRadiusFt: 35,
    arcAdjustable: true,
    defaultArc: 360,
    gpmAtDefaultRadius: 3.0,
    psi: 45,
    nozzle: '#3.0',
    popUpHeight: 4,
    features: ['PRS', 'SAM check valve', 'Adjustable arc'],
    planLabel: 'RTR',
  },
  {
    id: 'pgp-adj',
    category: 'rotor',
    name: 'Rotor - Small Turf',
    manufacturer: 'Hunter',
    model: 'PGP-ADJ',
    application: 'Small turf, courtyards',
    minRadiusFt: 22,
    maxRadiusFt: 52,
    defaultRadiusFt: 25,
    arcAdjustable: true,
    defaultArc: 360,
    gpmAtDefaultRadius: 2.2,
    psi: 45,
    nozzle: '#2.0',
    popUpHeight: 4,
    features: ['Rubber cover', 'Adjustable arc'],
    planLabel: 'RTR',
  },
  {
    id: '1804-sam-prs',
    category: 'spray',
    name: 'Spray - Fixed',
    manufacturer: 'Rain Bird',
    model: '1804-SAM-PRS',
    application: 'Beds, small turf < 15 ft',
    minRadiusFt: 8,
    maxRadiusFt: 15,
    defaultRadiusFt: 12,
    arcAdjustable: false,
    defaultArc: 360,
    gpmAtDefaultRadius: 1.5,
    psi: 30,
    nozzle: '15-SST',
    popUpHeight: 4,
    features: ['SAM', 'PRS at 30 PSI', '4-inch pop-up'],
    planLabel: 'SP',
  },
  {
    id: 'mp3000',
    category: 'rotary-nozzle',
    name: 'Spray - Rotary Nozzle',
    manufacturer: 'Hunter',
    model: 'MP Rotator MP3000',
    application: 'Medium beds, 8-21 ft strips',
    minRadiusFt: 8,
    maxRadiusFt: 21,
    defaultRadiusFt: 15,
    arcAdjustable: true,
    defaultArc: 360,
    gpmAtDefaultRadius: 0.9,
    psi: 40,
    nozzle: 'MP3000',
    features: ['Adjustable arc', 'Matched precip rate'],
    planLabel: 'RN',
  },
  {
    id: 'he-van-15-sst',
    category: 'strip',
    name: 'Spray - Strip',
    manufacturer: 'Rain Bird',
    model: 'HE-VAN-15-SST',
    application: 'Narrow strips < 8 ft',
    minRadiusFt: 4,
    maxRadiusFt: 15,
    defaultRadiusFt: 8,
    arcAdjustable: false,
    defaultArc: 180,
    gpmAtDefaultRadius: 1.0,
    psi: 30,
    nozzle: 'HE-VAN',
    features: ['Side strip pattern', '15 ft throw'],
    planLabel: 'SP',
  },
  {
    id: 'tlcv-09-12-500',
    category: 'drip',
    name: 'Drip Emitter Line',
    manufacturer: 'Netafim',
    model: 'Techline TLCV-09-12-500',
    application: 'Beds, tree rings, planters',
    minRadiusFt: 0,
    maxRadiusFt: 0,
    defaultRadiusFt: 0,
    arcAdjustable: false,
    defaultArc: 0,
    gpmAtDefaultRadius: 0,
    psi: 30,
    nozzle: '0.9 GPH @ 12" OC',
    features: ['0.9 GPH', '12-inch spacing', 'CV'],
    planLabel: 'DRIP',
  },
  {
    id: '44rc',
    category: 'quick-coupler',
    name: 'Quick Coupler Valve',
    manufacturer: 'Rain Bird',
    model: '44RC',
    application: 'Athletic field midfield/sideline',
    minRadiusFt: 0,
    maxRadiusFt: 0,
    defaultRadiusFt: 0,
    arcAdjustable: false,
    defaultArc: 0,
    gpmAtDefaultRadius: 0,
    psi: 0,
    nozzle: '',
    features: ['1-inch', 'Brass', 'Locking rubber cover'],
    planLabel: 'QC',
  },
];

export const VALVES: ValveSpec[] = [
  {
    id: 'peb-100',
    category: 'zone',
    name: 'Zone Valve - 1 inch',
    manufacturer: 'Rain Bird',
    model: 'PEB-100',
    application: 'Standard spray/drip zones',
    sizeIn: 1,
    features: ['Globe', 'Flow control', 'PEB solenoid'],
  },
  {
    id: 'peb-150',
    category: 'zone',
    name: 'Zone Valve - 1.5 inch',
    manufacturer: 'Rain Bird',
    model: 'PEB-150',
    application: 'Rotor zones > 15 GPM',
    sizeIn: 1.5,
    features: ['Globe', 'Flow control'],
  },
  {
    id: '200-peb',
    category: 'master',
    name: 'Master Valve',
    manufacturer: 'Rain Bird',
    model: '200-PEB',
    application: 'Main line shutoff',
    sizeIn: 2,
    features: ['Normally closed', '24V'],
  },
  {
    id: '009m2-qt',
    category: 'backflow',
    name: 'Backflow - RPZ',
    manufacturer: 'Watts',
    model: '009M2-QT',
    application: 'Point of connection',
    sizeIn: 1.5,
    features: ['Size per mainline', 'Tested annually'],
  },
];

export const CONTROLLERS: ControllerSpec[] = [
  {
    id: 'esp-lxme2',
    name: 'Controller',
    manufacturer: 'Rain Bird',
    model: 'ESP-LXME2',
    application: 'Central scheduling',
    stations: '8-48',
    features: ['Modular', 'Wi-Fi', 'ET capable'],
  },
];

export const SENSORS: SensorSpec[] = [
  {
    id: 'rain-clik',
    name: 'Rain Sensor',
    manufacturer: 'Hunter',
    model: 'Rain-Clik',
    type: 'rain',
    features: ['Wired', 'Adjustable 1/8-1 inch threshold'],
  },
  {
    id: 'bl-sm200',
    name: 'Soil Moisture Sensor',
    manufacturer: 'Baseline',
    model: 'BL-SM200',
    type: 'soil-moisture',
    features: ['Wireless', '8-inch depth probe'],
  },
];

export const PIPES: PipeSpec[] = [
  {
    id: 'main-2in',
    name: 'Mainline Pipe - 2 inch',
    material: 'Sch. 40 PVC, solvent weld',
    sizeIn: 2,
    application: 'POC to valve manifolds, > 40 GPM',
    type: 'mainline',
    maxGPM: 80,
    maxVelocityFPS: 5,
  },
  {
    id: 'main-1.5in',
    name: 'Mainline Pipe - 1.5 inch',
    material: 'Sch. 40 PVC, solvent weld',
    sizeIn: 1.5,
    application: 'POC to valve manifolds, < 40 GPM',
    type: 'mainline',
    maxGPM: 40,
    maxVelocityFPS: 5,
  },
  {
    id: 'lat-1in',
    name: 'Lateral Pipe - 1 inch',
    material: 'Class 200 PVC, solvent weld',
    sizeIn: 1,
    application: 'Valve to rotor heads',
    type: 'lateral',
    maxGPM: 15,
    maxVelocityFPS: 5,
  },
  {
    id: 'lat-0.75in',
    name: 'Lateral Pipe - 3/4 inch',
    material: 'Class 200 PVC, solvent weld',
    sizeIn: 0.75,
    application: 'Valve to spray heads',
    type: 'lateral',
    maxGPM: 10,
    maxVelocityFPS: 5,
  },
];

export const SWING_JOINT = {
  name: 'Swing Joint',
  manufacturer: 'Hunter',
  model: 'SJ-506',
  description: 'Triple swing, 6-inch flexible head connection',
};

export const VALVE_BOXES = {
  jumbo: {
    name: 'Valve Box - Standard',
    manufacturer: 'Carson',
    model: '1419-12',
    description: '14x19 jumbo, up to 4 valves',
  },
  round: {
    name: 'Valve Box - Round',
    manufacturer: 'NDS',
    model: '111BC',
    description: '10-inch round, individual valves',
  },
};

export const WIRE = {
  common: { name: 'Wire - Common', spec: '14 AWG UF, white', application: 'Common/ground wire' },
  zone: { name: 'Wire - Zone', spec: '18 AWG UF, color-coded', application: 'Individual valve control' },
};

export const DRIP_KIT = {
  name: 'Drip Zone Kit',
  manufacturer: 'Rain Bird',
  model: 'XCZ-100-PRB-COM',
  description: '1-inch, 150 mesh filter, 30 PSI PRV',
};

export function selectHeadForZone(
  zoneType: 'turf' | 'bed' | 'narrow-strip' | 'tree-ring' | 'planter',
  maxDimensionFt: number,
  isAthleticField: boolean
): HeadSpec {
  if (zoneType === 'narrow-strip') {
    return SPRINKLER_HEADS.find(h => h.id === 'he-van-15-sst')!;
  }
  if (zoneType === 'bed' || zoneType === 'tree-ring' || zoneType === 'planter') {
    if (maxDimensionFt <= 8) return SPRINKLER_HEADS.find(h => h.id === 'he-van-15-sst')!;
    if (maxDimensionFt <= 21) return SPRINKLER_HEADS.find(h => h.id === 'mp3000')!;
    return SPRINKLER_HEADS.find(h => h.id === '1804-sam-prs')!;
  }
  if (isAthleticField || maxDimensionFt > 80) {
    return SPRINKLER_HEADS.find(h => h.id === 'i-40-04-ss')!;
  }
  if (maxDimensionFt > 50) {
    return SPRINKLER_HEADS.find(h => h.id === '5004-pc-sam')!;
  }
  if (maxDimensionFt > 25) {
    return SPRINKLER_HEADS.find(h => h.id === 'pgp-adj')!;
  }
  return SPRINKLER_HEADS.find(h => h.id === '1804-sam-prs')!;
}

export function selectValveForZone(totalGPM: number): ValveSpec {
  if (totalGPM > 15) return VALVES.find(v => v.id === 'peb-150')!;
  return VALVES.find(v => v.id === 'peb-100')!;
}
