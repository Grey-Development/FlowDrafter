/**
 * FlowDrafter Hydraulic Design Data
 *
 * Friction loss tables, pressure calculations, and velocity constraints
 * Based on Hazen-Williams formula and manufacturer specifications
 *
 * Reference: Irrigation Association Certified Irrigation Designer manual
 */

// ============================================================================
// HAZEN-WILLIAMS COEFFICIENTS
// ============================================================================

export interface PipeMaterial {
  material: string;
  roughnessCoefficient: number;
  description: string;
  typicalApplication: string;
}

export const HAZEN_WILLIAMS_COEFFICIENTS: PipeMaterial[] = [
  {
    material: 'pvc-schedule-40',
    roughnessCoefficient: 150,
    description: 'Schedule 40 PVC - rigid pressure pipe',
    typicalApplication: 'Mainline and pressure applications',
  },
  {
    material: 'pvc-class-200',
    roughnessCoefficient: 150,
    description: 'Class 200 PVC - thinner wall for lower pressure',
    typicalApplication: 'Lateral lines, moderate pressure',
  },
  {
    material: 'pvc-class-315',
    roughnessCoefficient: 150,
    description: 'Class 315 PVC - standard irrigation lateral',
    typicalApplication: 'Lateral lines, standard applications',
  },
  {
    material: 'polyethylene',
    roughnessCoefficient: 140,
    description: 'PE pipe - flexible, UV resistant',
    typicalApplication: 'Drip supply lines, swing pipes',
  },
  {
    material: 'copper',
    roughnessCoefficient: 130,
    description: 'Copper pipe - rigid metal',
    typicalApplication: 'Above-grade supply, cold climates',
  },
  {
    material: 'galvanized-steel',
    roughnessCoefficient: 120,
    description: 'Galvanized steel - corrodes over time',
    typicalApplication: 'Legacy systems, risers',
  },
  {
    material: 'drip-tubing',
    roughnessCoefficient: 140,
    description: 'Drip emitter tubing - thin wall PE',
    typicalApplication: 'Drip irrigation distribution',
  },
];

// ============================================================================
// FRICTION LOSS TABLES (PSI loss per 100 feet)
// ============================================================================

export interface FrictionLossEntry {
  pipeSizeIn: number;
  material: string;
  gpm: number;
  velocityFPS: number;
  frictionLossPer100Ft: number;
}

/**
 * Friction loss table for PVC pipe (C=150)
 * Values calculated using Hazen-Williams formula:
 * hf = 10.44 * L * Q^1.85 / (C^1.85 * D^4.87)
 *
 * Where:
 * hf = head loss (feet)
 * L = length (feet)
 * Q = flow (GPM)
 * C = roughness coefficient
 * D = inside diameter (inches)
 */
export const PVC_FRICTION_LOSS: FrictionLossEntry[] = [
  // 3/4" PVC (ID = 0.824")
  { pipeSizeIn: 0.75, material: 'pvc-class-200', gpm: 2, velocityFPS: 1.2, frictionLossPer100Ft: 0.38 },
  { pipeSizeIn: 0.75, material: 'pvc-class-200', gpm: 4, velocityFPS: 2.4, frictionLossPer100Ft: 1.35 },
  { pipeSizeIn: 0.75, material: 'pvc-class-200', gpm: 6, velocityFPS: 3.6, frictionLossPer100Ft: 2.82 },
  { pipeSizeIn: 0.75, material: 'pvc-class-200', gpm: 8, velocityFPS: 4.8, frictionLossPer100Ft: 4.75 },
  { pipeSizeIn: 0.75, material: 'pvc-class-200', gpm: 10, velocityFPS: 6.0, frictionLossPer100Ft: 7.12 },

  // 1" PVC (ID = 1.049")
  { pipeSizeIn: 1.0, material: 'pvc-class-200', gpm: 4, velocityFPS: 1.5, frictionLossPer100Ft: 0.45 },
  { pipeSizeIn: 1.0, material: 'pvc-class-200', gpm: 6, velocityFPS: 2.2, frictionLossPer100Ft: 0.94 },
  { pipeSizeIn: 1.0, material: 'pvc-class-200', gpm: 8, velocityFPS: 3.0, frictionLossPer100Ft: 1.59 },
  { pipeSizeIn: 1.0, material: 'pvc-class-200', gpm: 10, velocityFPS: 3.7, frictionLossPer100Ft: 2.38 },
  { pipeSizeIn: 1.0, material: 'pvc-class-200', gpm: 12, velocityFPS: 4.5, frictionLossPer100Ft: 3.31 },
  { pipeSizeIn: 1.0, material: 'pvc-class-200', gpm: 15, velocityFPS: 5.6, frictionLossPer100Ft: 4.95 },

  // 1.25" PVC (ID = 1.380")
  { pipeSizeIn: 1.25, material: 'pvc-class-200', gpm: 8, velocityFPS: 1.7, frictionLossPer100Ft: 0.52 },
  { pipeSizeIn: 1.25, material: 'pvc-class-200', gpm: 10, velocityFPS: 2.1, frictionLossPer100Ft: 0.78 },
  { pipeSizeIn: 1.25, material: 'pvc-class-200', gpm: 12, velocityFPS: 2.6, frictionLossPer100Ft: 1.09 },
  { pipeSizeIn: 1.25, material: 'pvc-class-200', gpm: 15, velocityFPS: 3.2, frictionLossPer100Ft: 1.63 },
  { pipeSizeIn: 1.25, material: 'pvc-class-200', gpm: 18, velocityFPS: 3.9, frictionLossPer100Ft: 2.27 },
  { pipeSizeIn: 1.25, material: 'pvc-class-200', gpm: 22, velocityFPS: 4.7, frictionLossPer100Ft: 3.26 },

  // 1.5" PVC Schedule 40 (ID = 1.610")
  { pipeSizeIn: 1.5, material: 'pvc-schedule-40', gpm: 10, velocityFPS: 1.6, frictionLossPer100Ft: 0.38 },
  { pipeSizeIn: 1.5, material: 'pvc-schedule-40', gpm: 15, velocityFPS: 2.4, frictionLossPer100Ft: 0.79 },
  { pipeSizeIn: 1.5, material: 'pvc-schedule-40', gpm: 20, velocityFPS: 3.2, frictionLossPer100Ft: 1.33 },
  { pipeSizeIn: 1.5, material: 'pvc-schedule-40', gpm: 25, velocityFPS: 4.0, frictionLossPer100Ft: 2.00 },
  { pipeSizeIn: 1.5, material: 'pvc-schedule-40', gpm: 30, velocityFPS: 4.7, frictionLossPer100Ft: 2.78 },
  { pipeSizeIn: 1.5, material: 'pvc-schedule-40', gpm: 35, velocityFPS: 5.5, frictionLossPer100Ft: 3.68 },
  { pipeSizeIn: 1.5, material: 'pvc-schedule-40', gpm: 40, velocityFPS: 6.3, frictionLossPer100Ft: 4.69 },

  // 2" PVC Schedule 40 (ID = 2.067")
  { pipeSizeIn: 2.0, material: 'pvc-schedule-40', gpm: 20, velocityFPS: 1.9, frictionLossPer100Ft: 0.43 },
  { pipeSizeIn: 2.0, material: 'pvc-schedule-40', gpm: 30, velocityFPS: 2.9, frictionLossPer100Ft: 0.89 },
  { pipeSizeIn: 2.0, material: 'pvc-schedule-40', gpm: 40, velocityFPS: 3.8, frictionLossPer100Ft: 1.51 },
  { pipeSizeIn: 2.0, material: 'pvc-schedule-40', gpm: 50, velocityFPS: 4.8, frictionLossPer100Ft: 2.26 },
  { pipeSizeIn: 2.0, material: 'pvc-schedule-40', gpm: 60, velocityFPS: 5.7, frictionLossPer100Ft: 3.14 },
  { pipeSizeIn: 2.0, material: 'pvc-schedule-40', gpm: 70, velocityFPS: 6.7, frictionLossPer100Ft: 4.16 },
  { pipeSizeIn: 2.0, material: 'pvc-schedule-40', gpm: 80, velocityFPS: 7.6, frictionLossPer100Ft: 5.30 },
];

// ============================================================================
// FITTING EQUIVALENT LENGTHS (feet of pipe equivalent)
// ============================================================================

export interface FittingLoss {
  fitting: string;
  sizeIn: number;
  equivalentLengthFt: number;
  description: string;
}

export const FITTING_EQUIVALENT_LENGTHS: FittingLoss[] = [
  // 90-degree elbows
  { fitting: '90-elbow', sizeIn: 0.75, equivalentLengthFt: 2.0, description: '90° elbow' },
  { fitting: '90-elbow', sizeIn: 1.0, equivalentLengthFt: 2.5, description: '90° elbow' },
  { fitting: '90-elbow', sizeIn: 1.25, equivalentLengthFt: 3.0, description: '90° elbow' },
  { fitting: '90-elbow', sizeIn: 1.5, equivalentLengthFt: 4.0, description: '90° elbow' },
  { fitting: '90-elbow', sizeIn: 2.0, equivalentLengthFt: 5.0, description: '90° elbow' },

  // 45-degree elbows
  { fitting: '45-elbow', sizeIn: 0.75, equivalentLengthFt: 1.0, description: '45° elbow' },
  { fitting: '45-elbow', sizeIn: 1.0, equivalentLengthFt: 1.3, description: '45° elbow' },
  { fitting: '45-elbow', sizeIn: 1.25, equivalentLengthFt: 1.5, description: '45° elbow' },
  { fitting: '45-elbow', sizeIn: 1.5, equivalentLengthFt: 2.0, description: '45° elbow' },
  { fitting: '45-elbow', sizeIn: 2.0, equivalentLengthFt: 2.5, description: '45° elbow' },

  // Tees (flow through run)
  { fitting: 'tee-run', sizeIn: 0.75, equivalentLengthFt: 1.5, description: 'Tee, flow through run' },
  { fitting: 'tee-run', sizeIn: 1.0, equivalentLengthFt: 2.0, description: 'Tee, flow through run' },
  { fitting: 'tee-run', sizeIn: 1.25, equivalentLengthFt: 2.5, description: 'Tee, flow through run' },
  { fitting: 'tee-run', sizeIn: 1.5, equivalentLengthFt: 3.0, description: 'Tee, flow through run' },
  { fitting: 'tee-run', sizeIn: 2.0, equivalentLengthFt: 4.0, description: 'Tee, flow through run' },

  // Tees (flow through branch)
  { fitting: 'tee-branch', sizeIn: 0.75, equivalentLengthFt: 3.0, description: 'Tee, flow through branch' },
  { fitting: 'tee-branch', sizeIn: 1.0, equivalentLengthFt: 4.0, description: 'Tee, flow through branch' },
  { fitting: 'tee-branch', sizeIn: 1.25, equivalentLengthFt: 5.0, description: 'Tee, flow through branch' },
  { fitting: 'tee-branch', sizeIn: 1.5, equivalentLengthFt: 6.0, description: 'Tee, flow through branch' },
  { fitting: 'tee-branch', sizeIn: 2.0, equivalentLengthFt: 8.0, description: 'Tee, flow through branch' },

  // Gate valves (fully open)
  { fitting: 'gate-valve', sizeIn: 0.75, equivalentLengthFt: 0.5, description: 'Gate valve, fully open' },
  { fitting: 'gate-valve', sizeIn: 1.0, equivalentLengthFt: 0.6, description: 'Gate valve, fully open' },
  { fitting: 'gate-valve', sizeIn: 1.5, equivalentLengthFt: 0.8, description: 'Gate valve, fully open' },
  { fitting: 'gate-valve', sizeIn: 2.0, equivalentLengthFt: 1.0, description: 'Gate valve, fully open' },

  // Globe valves (zone valves)
  { fitting: 'globe-valve', sizeIn: 0.75, equivalentLengthFt: 15, description: 'Globe/zone valve' },
  { fitting: 'globe-valve', sizeIn: 1.0, equivalentLengthFt: 20, description: 'Globe/zone valve' },
  { fitting: 'globe-valve', sizeIn: 1.25, equivalentLengthFt: 25, description: 'Globe/zone valve' },
  { fitting: 'globe-valve', sizeIn: 1.5, equivalentLengthFt: 30, description: 'Globe/zone valve' },
  { fitting: 'globe-valve', sizeIn: 2.0, equivalentLengthFt: 40, description: 'Globe/zone valve' },

  // Swing joints
  { fitting: 'swing-joint', sizeIn: 0.5, equivalentLengthFt: 1.0, description: 'Triple swing joint assembly' },
];

// ============================================================================
// DEVICE PRESSURE LOSSES (PSI)
// ============================================================================

export interface DevicePressureLoss {
  device: string;
  sizeIn: number;
  pressureLossPSI: number;
  notes: string;
}

export const DEVICE_PRESSURE_LOSSES: DevicePressureLoss[] = [
  // Backflow preventers (RPZ)
  { device: 'rpz', sizeIn: 1.0, pressureLossPSI: 10, notes: 'Reduced Pressure Zone at design flow' },
  { device: 'rpz', sizeIn: 1.5, pressureLossPSI: 8, notes: 'Reduced Pressure Zone at design flow' },
  { device: 'rpz', sizeIn: 2.0, pressureLossPSI: 6, notes: 'Reduced Pressure Zone at design flow' },

  // Double check valves
  { device: 'dcva', sizeIn: 1.0, pressureLossPSI: 5, notes: 'Double Check Valve Assembly' },
  { device: 'dcva', sizeIn: 1.5, pressureLossPSI: 4, notes: 'Double Check Valve Assembly' },
  { device: 'dcva', sizeIn: 2.0, pressureLossPSI: 3, notes: 'Double Check Valve Assembly' },

  // Pressure vacuum breakers
  { device: 'pvb', sizeIn: 1.0, pressureLossPSI: 4, notes: 'Pressure Vacuum Breaker' },
  { device: 'pvb', sizeIn: 1.5, pressureLossPSI: 3, notes: 'Pressure Vacuum Breaker' },

  // Water meters
  { device: 'meter', sizeIn: 0.75, pressureLossPSI: 8, notes: 'Standard water meter at design flow' },
  { device: 'meter', sizeIn: 1.0, pressureLossPSI: 6, notes: 'Standard water meter at design flow' },
  { device: 'meter', sizeIn: 1.5, pressureLossPSI: 4, notes: 'Standard water meter at design flow' },
  { device: 'meter', sizeIn: 2.0, pressureLossPSI: 3, notes: 'Standard water meter at design flow' },

  // Filters
  { device: 'filter-150mesh', sizeIn: 1.0, pressureLossPSI: 5, notes: 'Clean 150-mesh filter for drip' },
  { device: 'filter-200mesh', sizeIn: 1.0, pressureLossPSI: 7, notes: 'Clean 200-mesh filter for drip' },

  // Pressure regulators
  { device: 'pressure-regulator', sizeIn: 1.0, pressureLossPSI: 3, notes: 'Inline pressure regulator' },
  { device: 'pressure-regulator', sizeIn: 1.5, pressureLossPSI: 2, notes: 'Inline pressure regulator' },
];

// ============================================================================
// VELOCITY CONSTRAINTS
// ============================================================================

export const VELOCITY_LIMITS = {
  /** Maximum velocity to prevent water hammer and pipe damage */
  maxVelocityFPS: 5.0,

  /** Warning threshold for elevated velocity */
  warningVelocityFPS: 4.0,

  /** Minimum velocity to prevent sediment accumulation */
  minVelocityFPS: 1.0,

  /** Maximum velocity for mainline under constant pressure */
  maxMainlineVelocityFPS: 5.0,

  /** Maximum velocity for lateral lines */
  maxLateralVelocityFPS: 5.0,
};

// ============================================================================
// PIPE CAPACITY BY SIZE
// ============================================================================

export interface PipeCapacity {
  sizeIn: number;
  material: string;
  insideDiameterIn: number;
  maxGPM: number;
  maxGPMAt5FPS: number;
  typicalApplication: string;
}

export const PIPE_CAPACITIES: PipeCapacity[] = [
  {
    sizeIn: 0.75,
    material: 'pvc-class-200',
    insideDiameterIn: 0.824,
    maxGPM: 10,
    maxGPMAt5FPS: 8,
    typicalApplication: 'Spray lateral, up to 4-5 spray heads',
  },
  {
    sizeIn: 1.0,
    material: 'pvc-class-200',
    insideDiameterIn: 1.049,
    maxGPM: 15,
    maxGPMAt5FPS: 13,
    typicalApplication: 'Standard lateral, spray or small rotor zones',
  },
  {
    sizeIn: 1.25,
    material: 'pvc-class-200',
    insideDiameterIn: 1.380,
    maxGPM: 22,
    maxGPMAt5FPS: 20,
    typicalApplication: 'Rotor lateral, medium zones',
  },
  {
    sizeIn: 1.5,
    material: 'pvc-schedule-40',
    insideDiameterIn: 1.610,
    maxGPM: 40,
    maxGPMAt5FPS: 32,
    typicalApplication: 'Small mainline, under 40 GPM systems',
  },
  {
    sizeIn: 2.0,
    material: 'pvc-schedule-40',
    insideDiameterIn: 2.067,
    maxGPM: 80,
    maxGPMAt5FPS: 55,
    typicalApplication: 'Standard mainline, 40-80 GPM systems',
  },
  {
    sizeIn: 2.5,
    material: 'pvc-schedule-40',
    insideDiameterIn: 2.469,
    maxGPM: 120,
    maxGPMAt5FPS: 80,
    typicalApplication: 'Large mainline, commercial systems',
  },
  {
    sizeIn: 3.0,
    material: 'pvc-schedule-40',
    insideDiameterIn: 3.068,
    maxGPM: 180,
    maxGPMAt5FPS: 120,
    typicalApplication: 'Large mainline, high-demand systems',
  },
];

// ============================================================================
// ELEVATION PRESSURE ADJUSTMENTS
// ============================================================================

export const ELEVATION_CONSTANTS = {
  /** PSI change per foot of elevation change */
  psiPerFootElevation: 0.433,

  /** Feet of head per PSI */
  feetPerPSI: 2.31,
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate velocity in pipe
 * @param gpm Flow rate in gallons per minute
 * @param insideDiameterIn Inside diameter in inches
 * @returns Velocity in feet per second
 */
export function calculateVelocity(gpm: number, insideDiameterIn: number): number {
  const areaFt2 = Math.PI * Math.pow(insideDiameterIn / 24, 2);
  const flowCFS = gpm / 448.831; // Convert GPM to cubic feet per second
  return flowCFS / areaFt2;
}

/**
 * Calculate friction loss using Hazen-Williams formula
 * @param gpm Flow rate in GPM
 * @param lengthFt Pipe length in feet
 * @param insideDiameterIn Inside diameter in inches
 * @param roughnessCoefficient Hazen-Williams C value (150 for PVC)
 * @returns Friction loss in PSI
 */
export function calculateFrictionLoss(
  gpm: number,
  lengthFt: number,
  insideDiameterIn: number,
  roughnessCoefficient: number = 150
): number {
  // Hazen-Williams formula: hf = 10.44 * L * Q^1.85 / (C^1.85 * D^4.87)
  // Where hf is in feet of head
  const headLossFt =
    (10.44 * lengthFt * Math.pow(gpm, 1.85)) /
    (Math.pow(roughnessCoefficient, 1.85) * Math.pow(insideDiameterIn, 4.87));

  // Convert feet of head to PSI
  return headLossFt * ELEVATION_CONSTANTS.psiPerFootElevation;
}

/**
 * Lookup friction loss from table (interpolated)
 */
export function lookupFrictionLoss(pipeSizeIn: number, gpm: number): number | undefined {
  const entries = PVC_FRICTION_LOSS.filter(e => e.pipeSizeIn === pipeSizeIn);
  if (entries.length === 0) return undefined;

  // Find closest entries for interpolation
  const sorted = entries.sort((a, b) => a.gpm - b.gpm);
  const lower = sorted.filter(e => e.gpm <= gpm).pop();
  const upper = sorted.find(e => e.gpm >= gpm);

  if (!lower && upper) return upper.frictionLossPer100Ft;
  if (lower && !upper) return lower.frictionLossPer100Ft;
  if (!lower || !upper) return undefined;

  if (lower.gpm === upper.gpm) return lower.frictionLossPer100Ft;

  // Linear interpolation
  const ratio = (gpm - lower.gpm) / (upper.gpm - lower.gpm);
  return lower.frictionLossPer100Ft + ratio * (upper.frictionLossPer100Ft - lower.frictionLossPer100Ft);
}

/**
 * Get fitting equivalent length
 */
export function getFittingEquivalentLength(fitting: string, sizeIn: number): number {
  const entry = FITTING_EQUIVALENT_LENGTHS.find(f => f.fitting === fitting && f.sizeIn === sizeIn);
  // If exact size not found, find closest
  if (!entry) {
    const sameType = FITTING_EQUIVALENT_LENGTHS.filter(f => f.fitting === fitting);
    const closest = sameType.reduce((prev, curr) =>
      Math.abs(curr.sizeIn - sizeIn) < Math.abs(prev.sizeIn - sizeIn) ? curr : prev
    );
    return closest?.equivalentLengthFt ?? 0;
  }
  return entry.equivalentLengthFt;
}

/**
 * Get device pressure loss
 */
export function getDevicePressureLoss(device: string, sizeIn: number): number {
  const entry = DEVICE_PRESSURE_LOSSES.find(d => d.device === device && d.sizeIn === sizeIn);
  if (!entry) {
    const sameType = DEVICE_PRESSURE_LOSSES.filter(d => d.device === device);
    const closest = sameType.reduce((prev, curr) =>
      Math.abs(curr.sizeIn - sizeIn) < Math.abs(prev.sizeIn - sizeIn) ? curr : prev
    );
    return closest?.pressureLossPSI ?? 0;
  }
  return entry.pressureLossPSI;
}

/**
 * Calculate elevation pressure adjustment
 * @param elevationChangeFt Positive = uphill, Negative = downhill
 * @returns PSI adjustment (negative for uphill, positive for downhill)
 */
export function calculateElevationPressureChange(elevationChangeFt: number): number {
  return -elevationChangeFt * ELEVATION_CONSTANTS.psiPerFootElevation;
}

/**
 * Get pipe capacity at max velocity
 */
export function getPipeCapacity(sizeIn: number): PipeCapacity | undefined {
  return PIPE_CAPACITIES.find(p => p.sizeIn === sizeIn);
}

/**
 * Recommend pipe size for given GPM
 */
export function recommendPipeSize(gpm: number, application: 'mainline' | 'lateral'): PipeCapacity | undefined {
  const suitable = PIPE_CAPACITIES.filter(p => {
    if (application === 'mainline') {
      return p.maxGPMAt5FPS >= gpm && p.sizeIn >= 1.5;
    }
    return p.maxGPMAt5FPS >= gpm && p.sizeIn <= 1.5;
  });

  // Return smallest suitable pipe
  return suitable.sort((a, b) => a.sizeIn - b.sizeIn)[0];
}

/**
 * Calculate total system pressure loss
 */
export function calculateSystemPressureLoss(params: {
  staticPressurePSI: number;
  mainlineLengthFt: number;
  mainlineSizeIn: number;
  mainlineGPM: number;
  lateralLengthFt: number;
  lateralSizeIn: number;
  lateralGPM: number;
  elevationChangeFt: number;
  hasRPZ: boolean;
  rpzSizeIn?: number;
  hasMasterValve: boolean;
  hasZoneValve: boolean;
  zoneValveSizeIn?: number;
}): {
  staticPressure: number;
  rpzLoss: number;
  mainlineLoss: number;
  masterValveLoss: number;
  zoneValveLoss: number;
  lateralLoss: number;
  elevationLoss: number;
  totalLoss: number;
  pressureAtHead: number;
  adequate: boolean;
  minimumRequired: number;
} {
  const rpzLoss = params.hasRPZ ? getDevicePressureLoss('rpz', params.rpzSizeIn ?? 1.5) : 0;

  const mainlineLossPer100 = lookupFrictionLoss(params.mainlineSizeIn, params.mainlineGPM) ?? 0;
  const mainlineLoss = (mainlineLossPer100 * params.mainlineLengthFt) / 100;

  const masterValveLoss = params.hasMasterValve ? 2 : 0; // Typical master valve loss

  const zoneValveLoss = params.hasZoneValve
    ? getFittingEquivalentLength('globe-valve', params.zoneValveSizeIn ?? 1) * 0.05
    : 0;

  const lateralLossPer100 = lookupFrictionLoss(params.lateralSizeIn, params.lateralGPM) ?? 0;
  const lateralLoss = (lateralLossPer100 * params.lateralLengthFt) / 100;

  const elevationLoss = calculateElevationPressureChange(params.elevationChangeFt);

  const totalLoss = rpzLoss + mainlineLoss + masterValveLoss + zoneValveLoss + lateralLoss + Math.abs(elevationLoss);
  const pressureAtHead = params.staticPressurePSI - totalLoss + (elevationLoss < 0 ? 0 : elevationLoss);

  // Minimum required depends on head type (30 PSI spray, 45 PSI rotor)
  const minimumRequired = params.lateralGPM > 10 ? 45 : 30;

  return {
    staticPressure: params.staticPressurePSI,
    rpzLoss,
    mainlineLoss,
    masterValveLoss,
    zoneValveLoss,
    lateralLoss,
    elevationLoss: Math.abs(elevationLoss),
    totalLoss,
    pressureAtHead,
    adequate: pressureAtHead >= minimumRequired,
    minimumRequired,
  };
}
