/**
 * FlowDrafter Nozzle Performance Data
 *
 * Comprehensive nozzle specifications from Hunter and Rain Bird
 * Including GPM by pressure, throw distance, and precipitation rates
 *
 * Data sources: Hunter Industries and Rain Bird product catalogs
 */

// ============================================================================
// NOZZLE PERFORMANCE TABLES
// ============================================================================

export interface NozzlePerformancePoint {
  pressurePSI: number;
  radiusFt: number;
  gpm: number;
}

export interface NozzleSpec {
  id: string;
  manufacturer: 'Hunter' | 'Rain Bird' | 'Netafim';
  model: string;
  category: 'rotor' | 'spray' | 'rotary-nozzle' | 'strip' | 'drip';
  description: string;
  arcOptions: number[];
  defaultArc: number;
  minPressurePSI: number;
  maxPressurePSI: number;
  optimalPressurePSI: number;
  performanceTable: NozzlePerformancePoint[];
  precipitationRates: {
    arc: number;
    spacing: 'square' | 'triangular';
    spacingFt: number;
    precipInPerHr: number;
  }[];
  notes: string[];
}

// ============================================================================
// HUNTER ROTORS
// ============================================================================

export const HUNTER_I40_NOZZLES: NozzleSpec[] = [
  {
    id: 'i40-nozzle-4',
    manufacturer: 'Hunter',
    model: 'I-40 #4.0',
    category: 'rotor',
    description: 'Large turf rotor, 4.0 nozzle',
    arcOptions: [40, 360],
    defaultArc: 360,
    minPressurePSI: 40,
    maxPressurePSI: 70,
    optimalPressurePSI: 50,
    performanceTable: [
      { pressurePSI: 40, radiusFt: 38, gpm: 3.0 },
      { pressurePSI: 45, radiusFt: 40, gpm: 3.3 },
      { pressurePSI: 50, radiusFt: 42, gpm: 3.5 },
      { pressurePSI: 55, radiusFt: 43, gpm: 3.7 },
      { pressurePSI: 60, radiusFt: 44, gpm: 3.9 },
      { pressurePSI: 70, radiusFt: 46, gpm: 4.2 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 42, precipInPerHr: 0.35 },
      { arc: 360, spacing: 'triangular', spacingFt: 42, precipInPerHr: 0.40 },
      { arc: 180, spacing: 'square', spacingFt: 42, precipInPerHr: 0.35 },
      { arc: 90, spacing: 'square', spacingFt: 42, precipInPerHr: 0.35 },
    ],
    notes: ['Stainless steel riser', 'Part-circle adjustable 40-360', 'Low trajectory for wind resistance'],
  },
  {
    id: 'i40-nozzle-6',
    manufacturer: 'Hunter',
    model: 'I-40 #6.0',
    category: 'rotor',
    description: 'Large turf rotor, 6.0 nozzle',
    arcOptions: [40, 360],
    defaultArc: 360,
    minPressurePSI: 40,
    maxPressurePSI: 70,
    optimalPressurePSI: 50,
    performanceTable: [
      { pressurePSI: 40, radiusFt: 40, gpm: 4.5 },
      { pressurePSI: 45, radiusFt: 42, gpm: 4.9 },
      { pressurePSI: 50, radiusFt: 44, gpm: 5.2 },
      { pressurePSI: 55, radiusFt: 46, gpm: 5.5 },
      { pressurePSI: 60, radiusFt: 48, gpm: 5.8 },
      { pressurePSI: 70, radiusFt: 50, gpm: 6.2 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 44, precipInPerHr: 0.47 },
      { arc: 360, spacing: 'triangular', spacingFt: 44, precipInPerHr: 0.54 },
      { arc: 180, spacing: 'square', spacingFt: 44, precipInPerHr: 0.47 },
      { arc: 90, spacing: 'square', spacingFt: 44, precipInPerHr: 0.47 },
    ],
    notes: ['Standard nozzle for athletic fields', 'Good for 80-100 ft spacing'],
  },
];

export const HUNTER_PGP_NOZZLES: NozzleSpec[] = [
  {
    id: 'pgp-nozzle-2',
    manufacturer: 'Hunter',
    model: 'PGP #2.0',
    category: 'rotor',
    description: 'Small rotor, 2.0 nozzle',
    arcOptions: [40, 360],
    defaultArc: 360,
    minPressurePSI: 25,
    maxPressurePSI: 70,
    optimalPressurePSI: 45,
    performanceTable: [
      { pressurePSI: 25, radiusFt: 22, gpm: 1.3 },
      { pressurePSI: 30, radiusFt: 24, gpm: 1.5 },
      { pressurePSI: 35, radiusFt: 25, gpm: 1.7 },
      { pressurePSI: 40, radiusFt: 26, gpm: 1.9 },
      { pressurePSI: 45, radiusFt: 27, gpm: 2.0 },
      { pressurePSI: 50, radiusFt: 28, gpm: 2.2 },
      { pressurePSI: 55, radiusFt: 29, gpm: 2.4 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 27, precipInPerHr: 0.48 },
      { arc: 360, spacing: 'triangular', spacingFt: 27, precipInPerHr: 0.55 },
      { arc: 180, spacing: 'square', spacingFt: 27, precipInPerHr: 0.48 },
      { arc: 90, spacing: 'square', spacingFt: 27, precipInPerHr: 0.48 },
    ],
    notes: ['Rubber cover standard', 'Good for small to medium turf'],
  },
  {
    id: 'pgp-nozzle-4',
    manufacturer: 'Hunter',
    model: 'PGP #4.0',
    category: 'rotor',
    description: 'Small rotor, 4.0 nozzle for larger areas',
    arcOptions: [40, 360],
    defaultArc: 360,
    minPressurePSI: 25,
    maxPressurePSI: 70,
    optimalPressurePSI: 45,
    performanceTable: [
      { pressurePSI: 25, radiusFt: 28, gpm: 2.0 },
      { pressurePSI: 30, radiusFt: 30, gpm: 2.3 },
      { pressurePSI: 35, radiusFt: 32, gpm: 2.6 },
      { pressurePSI: 40, radiusFt: 34, gpm: 2.8 },
      { pressurePSI: 45, radiusFt: 35, gpm: 3.0 },
      { pressurePSI: 50, radiusFt: 36, gpm: 3.2 },
      { pressurePSI: 55, radiusFt: 37, gpm: 3.5 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 35, precipInPerHr: 0.43 },
      { arc: 360, spacing: 'triangular', spacingFt: 35, precipInPerHr: 0.50 },
    ],
    notes: ['Upgrade option when more throw needed'],
  },
];

// ============================================================================
// HUNTER MP ROTATOR NOZZLES
// ============================================================================

export const HUNTER_MP_ROTATOR_NOZZLES: NozzleSpec[] = [
  {
    id: 'mp1000',
    manufacturer: 'Hunter',
    model: 'MP1000',
    category: 'rotary-nozzle',
    description: 'Short throw rotary nozzle',
    arcOptions: [90, 180, 210, 270, 360],
    defaultArc: 360,
    minPressurePSI: 25,
    maxPressurePSI: 55,
    optimalPressurePSI: 40,
    performanceTable: [
      { pressurePSI: 25, radiusFt: 8, gpm: 0.16 },
      { pressurePSI: 30, radiusFt: 9, gpm: 0.19 },
      { pressurePSI: 35, radiusFt: 10, gpm: 0.22 },
      { pressurePSI: 40, radiusFt: 11, gpm: 0.25 },
      { pressurePSI: 45, radiusFt: 12, gpm: 0.28 },
      { pressurePSI: 55, radiusFt: 13.5, gpm: 0.34 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 11, precipInPerHr: 0.36 },
      { arc: 180, spacing: 'square', spacingFt: 11, precipInPerHr: 0.36 },
      { arc: 90, spacing: 'square', spacingFt: 11, precipInPerHr: 0.36 },
    ],
    notes: ['Matched precipitation regardless of arc', 'Low application rate ideal for clay soil'],
  },
  {
    id: 'mp2000',
    manufacturer: 'Hunter',
    model: 'MP2000',
    category: 'rotary-nozzle',
    description: 'Medium throw rotary nozzle',
    arcOptions: [90, 180, 210, 270, 360],
    defaultArc: 360,
    minPressurePSI: 25,
    maxPressurePSI: 55,
    optimalPressurePSI: 40,
    performanceTable: [
      { pressurePSI: 25, radiusFt: 13, gpm: 0.30 },
      { pressurePSI: 30, radiusFt: 14, gpm: 0.36 },
      { pressurePSI: 35, radiusFt: 15, gpm: 0.42 },
      { pressurePSI: 40, radiusFt: 16, gpm: 0.48 },
      { pressurePSI: 45, radiusFt: 17, gpm: 0.54 },
      { pressurePSI: 55, radiusFt: 19, gpm: 0.65 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 16, precipInPerHr: 0.40 },
      { arc: 180, spacing: 'square', spacingFt: 16, precipInPerHr: 0.40 },
      { arc: 90, spacing: 'square', spacingFt: 16, precipInPerHr: 0.40 },
    ],
    notes: ['Most versatile MP Rotator', 'Good for beds and small turf'],
  },
  {
    id: 'mp3000',
    manufacturer: 'Hunter',
    model: 'MP3000',
    category: 'rotary-nozzle',
    description: 'Long throw rotary nozzle',
    arcOptions: [90, 180, 210, 270, 360],
    defaultArc: 360,
    minPressurePSI: 25,
    maxPressurePSI: 55,
    optimalPressurePSI: 40,
    performanceTable: [
      { pressurePSI: 25, radiusFt: 22, gpm: 0.60 },
      { pressurePSI: 30, radiusFt: 24, gpm: 0.72 },
      { pressurePSI: 35, radiusFt: 26, gpm: 0.84 },
      { pressurePSI: 40, radiusFt: 28, gpm: 0.96 },
      { pressurePSI: 45, radiusFt: 29, gpm: 1.08 },
      { pressurePSI: 55, radiusFt: 31, gpm: 1.30 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 28, precipInPerHr: 0.45 },
      { arc: 180, spacing: 'square', spacingFt: 28, precipInPerHr: 0.45 },
      { arc: 90, spacing: 'square', spacingFt: 28, precipInPerHr: 0.45 },
    ],
    notes: ['Best for transitioning to rotor zones', 'Matched precip with MP2000'],
  },
  {
    id: 'mp-strip',
    manufacturer: 'Hunter',
    model: 'MP Strip',
    category: 'strip',
    description: 'Side-throw pattern for narrow strips',
    arcOptions: [180],
    defaultArc: 180,
    minPressurePSI: 25,
    maxPressurePSI: 55,
    optimalPressurePSI: 40,
    performanceTable: [
      { pressurePSI: 25, radiusFt: 4, gpm: 0.12 },
      { pressurePSI: 30, radiusFt: 5, gpm: 0.15 },
      { pressurePSI: 40, radiusFt: 6, gpm: 0.20 },
      { pressurePSI: 55, radiusFt: 7, gpm: 0.28 },
    ],
    precipitationRates: [
      { arc: 180, spacing: 'square', spacingFt: 5, precipInPerHr: 0.40 },
    ],
    notes: ['Width: 4 ft at 40 PSI', 'Length: 15 ft', 'Ideal for strips 4-8 ft wide'],
  },
];

// ============================================================================
// RAIN BIRD ROTORS
// ============================================================================

export const RAINBIRD_5004_NOZZLES: NozzleSpec[] = [
  {
    id: '5004-nozzle-2',
    manufacturer: 'Rain Bird',
    model: '5004-PC #2.0',
    category: 'rotor',
    description: 'Medium rotor, 2.0 nozzle',
    arcOptions: [40, 360],
    defaultArc: 360,
    minPressurePSI: 25,
    maxPressurePSI: 65,
    optimalPressurePSI: 45,
    performanceTable: [
      { pressurePSI: 25, radiusFt: 25, gpm: 1.65 },
      { pressurePSI: 30, radiusFt: 27, gpm: 1.85 },
      { pressurePSI: 35, radiusFt: 29, gpm: 2.05 },
      { pressurePSI: 40, radiusFt: 31, gpm: 2.20 },
      { pressurePSI: 45, radiusFt: 33, gpm: 2.40 },
      { pressurePSI: 50, radiusFt: 35, gpm: 2.55 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 33, precipInPerHr: 0.39 },
      { arc: 360, spacing: 'triangular', spacingFt: 33, precipInPerHr: 0.45 },
      { arc: 180, spacing: 'square', spacingFt: 33, precipInPerHr: 0.39 },
      { arc: 90, spacing: 'square', spacingFt: 33, precipInPerHr: 0.39 },
    ],
    notes: ['Pressure regulated at 45 PSI (PC model)', 'SAM check valve standard'],
  },
  {
    id: '5004-nozzle-3',
    manufacturer: 'Rain Bird',
    model: '5004-PC #3.0',
    category: 'rotor',
    description: 'Medium rotor, 3.0 nozzle',
    arcOptions: [40, 360],
    defaultArc: 360,
    minPressurePSI: 25,
    maxPressurePSI: 65,
    optimalPressurePSI: 45,
    performanceTable: [
      { pressurePSI: 25, radiusFt: 28, gpm: 2.30 },
      { pressurePSI: 30, radiusFt: 30, gpm: 2.55 },
      { pressurePSI: 35, radiusFt: 32, gpm: 2.80 },
      { pressurePSI: 40, radiusFt: 34, gpm: 3.00 },
      { pressurePSI: 45, radiusFt: 35, gpm: 3.20 },
      { pressurePSI: 50, radiusFt: 37, gpm: 3.40 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 35, precipInPerHr: 0.46 },
      { arc: 360, spacing: 'triangular', spacingFt: 35, precipInPerHr: 0.53 },
    ],
    notes: ['Most common nozzle for medium turf', 'Matched precipitation with Rain Bird R-VAN'],
  },
];

// ============================================================================
// RAIN BIRD SPRAY NOZZLES
// ============================================================================

export const RAINBIRD_SPRAY_NOZZLES: NozzleSpec[] = [
  {
    id: '8-sst',
    manufacturer: 'Rain Bird',
    model: '8-SST',
    category: 'spray',
    description: 'Fixed spray, 8 ft radius',
    arcOptions: [90, 180, 360],
    defaultArc: 360,
    minPressurePSI: 15,
    maxPressurePSI: 30,
    optimalPressurePSI: 30,
    performanceTable: [
      { pressurePSI: 15, radiusFt: 6, gpm: 0.55 },
      { pressurePSI: 20, radiusFt: 7, gpm: 0.65 },
      { pressurePSI: 25, radiusFt: 7.5, gpm: 0.75 },
      { pressurePSI: 30, radiusFt: 8, gpm: 0.80 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 8, precipInPerHr: 1.57 },
      { arc: 180, spacing: 'square', spacingFt: 8, precipInPerHr: 1.57 },
      { arc: 90, spacing: 'square', spacingFt: 8, precipInPerHr: 1.57 },
    ],
    notes: ['High precip rate - use on sandy soil', 'Stainless steel riser'],
  },
  {
    id: '12-sst',
    manufacturer: 'Rain Bird',
    model: '12-SST',
    category: 'spray',
    description: 'Fixed spray, 12 ft radius',
    arcOptions: [90, 180, 360],
    defaultArc: 360,
    minPressurePSI: 15,
    maxPressurePSI: 30,
    optimalPressurePSI: 30,
    performanceTable: [
      { pressurePSI: 15, radiusFt: 10, gpm: 1.10 },
      { pressurePSI: 20, radiusFt: 11, gpm: 1.30 },
      { pressurePSI: 25, radiusFt: 11.5, gpm: 1.45 },
      { pressurePSI: 30, radiusFt: 12, gpm: 1.55 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 12, precipInPerHr: 1.71 },
      { arc: 180, spacing: 'square', spacingFt: 12, precipInPerHr: 1.71 },
      { arc: 90, spacing: 'square', spacingFt: 12, precipInPerHr: 1.71 },
    ],
    notes: ['Standard spray for small turf', 'High precip rate'],
  },
  {
    id: '15-sst',
    manufacturer: 'Rain Bird',
    model: '15-SST',
    category: 'spray',
    description: 'Fixed spray, 15 ft radius',
    arcOptions: [90, 180, 360],
    defaultArc: 360,
    minPressurePSI: 15,
    maxPressurePSI: 30,
    optimalPressurePSI: 30,
    performanceTable: [
      { pressurePSI: 15, radiusFt: 12, gpm: 1.50 },
      { pressurePSI: 20, radiusFt: 13, gpm: 1.75 },
      { pressurePSI: 25, radiusFt: 14, gpm: 1.95 },
      { pressurePSI: 30, radiusFt: 15, gpm: 2.10 },
    ],
    precipitationRates: [
      { arc: 360, spacing: 'square', spacingFt: 15, precipInPerHr: 1.55 },
      { arc: 180, spacing: 'square', spacingFt: 15, precipInPerHr: 1.55 },
      { arc: 90, spacing: 'square', spacingFt: 15, precipInPerHr: 1.55 },
    ],
    notes: ['Maximum throw for spray heads', 'Not recommended for clay soil'],
  },
  {
    id: 'he-van-15',
    manufacturer: 'Rain Bird',
    model: 'HE-VAN-15',
    category: 'strip',
    description: 'Variable arc strip nozzle',
    arcOptions: [0, 360],
    defaultArc: 180,
    minPressurePSI: 15,
    maxPressurePSI: 30,
    optimalPressurePSI: 30,
    performanceTable: [
      { pressurePSI: 15, radiusFt: 12, gpm: 0.85 },
      { pressurePSI: 20, radiusFt: 13, gpm: 0.95 },
      { pressurePSI: 25, radiusFt: 14, gpm: 1.05 },
      { pressurePSI: 30, radiusFt: 15, gpm: 1.15 },
    ],
    precipitationRates: [
      { arc: 180, spacing: 'square', spacingFt: 8, precipInPerHr: 1.85 },
    ],
    notes: ['Adjustable pattern 0-360°', 'For strips and odd-shaped areas'],
  },
];

// ============================================================================
// DRIP SPECIFICATIONS
// ============================================================================

export interface DripEmitterSpec {
  id: string;
  manufacturer: 'Netafim' | 'Rain Bird' | 'Hunter';
  model: string;
  emitterType: 'inline' | 'point-source' | 'micro-spray';
  gph: number;
  spacingIn: number;
  operatingPressurePSI: number;
  flowVariation: number;
  notes: string[];
}

export const DRIP_EMITTERS: DripEmitterSpec[] = [
  {
    id: 'techline-cv-09-12',
    manufacturer: 'Netafim',
    model: 'Techline CV 0.9 GPH @ 12"',
    emitterType: 'inline',
    gph: 0.9,
    spacingIn: 12,
    operatingPressurePSI: 25,
    flowVariation: 0.03,
    notes: ['Check valve prevents drainage', 'Best for slopes', '500 ft max run'],
  },
  {
    id: 'techline-cv-06-12',
    manufacturer: 'Netafim',
    model: 'Techline CV 0.6 GPH @ 12"',
    emitterType: 'inline',
    gph: 0.6,
    spacingIn: 12,
    operatingPressurePSI: 25,
    flowVariation: 0.03,
    notes: ['Lower flow for clay soil', 'Check valve prevents drainage'],
  },
  {
    id: 'techline-cv-09-18',
    manufacturer: 'Netafim',
    model: 'Techline CV 0.9 GPH @ 18"',
    emitterType: 'inline',
    gph: 0.9,
    spacingIn: 18,
    operatingPressurePSI: 25,
    flowVariation: 0.03,
    notes: ['Wider spacing for shrub beds', 'Rows at 18" OC'],
  },
  {
    id: 'xfs-06-12',
    manufacturer: 'Rain Bird',
    model: 'XFS 0.6 GPH @ 12"',
    emitterType: 'inline',
    gph: 0.6,
    spacingIn: 12,
    operatingPressurePSI: 20,
    flowVariation: 0.05,
    notes: ['Copper Shield root intrusion barrier', 'Good for turf subsurface'],
  },
];

// ============================================================================
// AGGREGATE NOZZLE DATABASE
// ============================================================================

export const ALL_NOZZLES: NozzleSpec[] = [
  ...HUNTER_I40_NOZZLES,
  ...HUNTER_PGP_NOZZLES,
  ...HUNTER_MP_ROTATOR_NOZZLES,
  ...RAINBIRD_5004_NOZZLES,
  ...RAINBIRD_SPRAY_NOZZLES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get nozzle performance at specific pressure
 */
export function getNozzlePerformance(nozzleId: string, pressurePSI: number): NozzlePerformancePoint | undefined {
  const nozzle = ALL_NOZZLES.find(n => n.id === nozzleId);
  if (!nozzle) return undefined;

  const table = nozzle.performanceTable;
  const sorted = table.sort((a, b) => a.pressurePSI - b.pressurePSI);

  // Find bracketing entries for interpolation
  const lower = sorted.filter(p => p.pressurePSI <= pressurePSI).pop();
  const upper = sorted.find(p => p.pressurePSI >= pressurePSI);

  if (!lower && upper) return upper;
  if (lower && !upper) return lower;
  if (!lower || !upper) return undefined;
  if (lower.pressurePSI === upper.pressurePSI) return lower;

  // Linear interpolation
  const ratio = (pressurePSI - lower.pressurePSI) / (upper.pressurePSI - lower.pressurePSI);
  return {
    pressurePSI,
    radiusFt: lower.radiusFt + ratio * (upper.radiusFt - lower.radiusFt),
    gpm: lower.gpm + ratio * (upper.gpm - lower.gpm),
  };
}

/**
 * Calculate precipitation rate for a nozzle at specific arc and spacing
 * Formula: PR (in/hr) = (96.25 × GPM) / (spacing² for square, or 0.866 × spacing² for triangular)
 */
export function calculatePrecipRate(gpm: number, spacingFt: number, pattern: 'square' | 'triangular', arc: number): number {
  const fullCircleGPM = arc === 360 ? gpm : gpm * (360 / arc);
  const area = pattern === 'square' ? spacingFt * spacingFt : 0.866 * spacingFt * spacingFt;
  return (96.25 * fullCircleGPM) / area;
}

/**
 * Get GPM for partial arc (matched precipitation nozzles maintain same rate)
 */
export function getGPMForArc(fullCircleGPM: number, arc: number, isMatchedPrecip: boolean): number {
  if (isMatchedPrecip) {
    // Matched precipitation nozzles use proportionally less water for partial arcs
    return fullCircleGPM * (arc / 360);
  }
  // Standard nozzles have same GPM regardless of arc (hence unmatched precip)
  return fullCircleGPM;
}

/**
 * Check if nozzle combination has matched precipitation rates
 */
export function hasMatchedPrecipitation(nozzleIds: string[]): boolean {
  const nozzles = nozzleIds.map(id => ALL_NOZZLES.find(n => n.id === id)).filter(Boolean) as NozzleSpec[];
  if (nozzles.length === 0) return true;

  // Check if all nozzles are from same matched-precip family
  const mpRotators = nozzles.every(n => n.category === 'rotary-nozzle' && n.manufacturer === 'Hunter');
  const sameModel = nozzles.every(n => n.model.split(' ')[0] === nozzles[0].model.split(' ')[0]);

  return mpRotators || sameModel;
}

/**
 * Get nozzles suitable for a given radius requirement
 */
export function getNozzlesForRadius(radiusFt: number, category?: 'rotor' | 'spray' | 'rotary-nozzle'): NozzleSpec[] {
  return ALL_NOZZLES.filter(nozzle => {
    if (category && nozzle.category !== category) return false;
    const minRadius = Math.min(...nozzle.performanceTable.map(p => p.radiusFt));
    const maxRadius = Math.max(...nozzle.performanceTable.map(p => p.radiusFt));
    return radiusFt >= minRadius && radiusFt <= maxRadius;
  });
}

/**
 * Get recommended nozzle for zone characteristics
 */
export function recommendNozzle(params: {
  maxDimensionFt: number;
  soilType: 'clay' | 'loam' | 'sand';
  zoneType: 'turf' | 'bed' | 'narrow-strip';
  availablePressurePSI: number;
}): NozzleSpec | undefined {
  // Filter by radius capability
  const candidates = ALL_NOZZLES.filter(n => {
    const maxRadius = Math.max(...n.performanceTable.map(p => p.radiusFt));
    const minPressure = n.minPressurePSI;
    return maxRadius >= params.maxDimensionFt / 2 && params.availablePressurePSI >= minPressure;
  });

  if (candidates.length === 0) return undefined;

  // For clay soil, prefer low precipitation rate (rotary nozzles)
  if (params.soilType === 'clay') {
    const rotary = candidates.find(n => n.category === 'rotary-nozzle');
    if (rotary) return rotary;
  }

  // For narrow strips
  if (params.zoneType === 'narrow-strip') {
    const strip = candidates.find(n => n.category === 'strip');
    if (strip) return strip;
  }

  // For turf, prefer rotors for efficiency
  if (params.zoneType === 'turf' && params.maxDimensionFt > 25) {
    const rotor = candidates.find(n => n.category === 'rotor');
    if (rotor) return rotor;
  }

  // Default to first suitable candidate
  return candidates[0];
}
