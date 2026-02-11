/**
 * FlowDrafter Irrigation Design Knowledge Base
 *
 * Professional irrigation design methodology based on:
 * - Irrigation Association Best Management Practices
 * - Hunter and Rain Bird manufacturer specifications
 * - Southeast US (Georgia/Atlanta) regional requirements
 * - ASAE/ASABE standards for uniformity
 */

// ============================================================================
// DESIGN METHODOLOGY
// ============================================================================

export interface DesignPhase {
  phase: string;
  description: string;
  tasks: string[];
  criticalChecks: string[];
}

export const DESIGN_METHODOLOGY: DesignPhase[] = [
  {
    phase: 'site-analysis',
    description: 'Evaluate site conditions from aerial imagery and project data',
    tasks: [
      'Identify all irrigable zones (turf, beds, narrow strips)',
      'Map hardscape boundaries and exclusion areas',
      'Locate water source (POC) and potential controller locations',
      'Assess sun/shade exposure patterns from tree canopy',
      'Identify slope indicators and drainage patterns',
      'Estimate zone dimensions and total irrigable area',
      'Note any obstacles (utilities, structures, trees)',
    ],
    criticalChecks: [
      'Water source location identified',
      'All irrigable areas mapped',
      'Exposure patterns documented',
      'Scale reference established',
    ],
  },
  {
    phase: 'water-source-evaluation',
    description: 'Determine available water supply characteristics',
    tasks: [
      'Record static water pressure at POC',
      'Calculate available GPM based on supply size',
      'Account for backflow device pressure loss (10-15 PSI typical)',
      'Determine design working pressure at heads',
      'Establish maximum system GPM (simultaneous zone operation)',
    ],
    criticalChecks: [
      'Static pressure recorded',
      'GPM availability calculated',
      'Working pressure sufficient for selected heads (min 30 PSI spray, 45 PSI rotor)',
    ],
  },
  {
    phase: 'head-layout',
    description: 'Place sprinkler heads for complete coverage',
    tasks: [
      'Select appropriate head type for each zone',
      'Establish head-to-head spacing (radius = spacing)',
      'Place corner heads first (90° arcs)',
      'Fill perimeter with edge heads (180° arcs)',
      'Complete interior with full-circle heads (360° arcs)',
      'Adjust arcs for irregular boundaries',
      'Add quick couplers for athletic fields',
    ],
    criticalChecks: [
      'Head-to-head coverage verified',
      'No overspray onto hardscape',
      'Arc patterns match boundary conditions',
      'Matched precipitation within zones',
    ],
  },
  {
    phase: 'zone-assignment',
    description: 'Group heads into hydraulically balanced zones',
    tasks: [
      'Group heads by type (never mix rotors and sprays)',
      'Separate turf zones from bed zones',
      'Separate full-sun from shaded areas',
      'Separate steep slopes (>4:1) into own zones',
      'Calculate zone GPM (sum of all heads)',
      'Verify zone GPM within lateral capacity (15 GPM for 1", 22 GPM for 1.25")',
      'Assign zone numbers and colors',
    ],
    criticalChecks: [
      'No mixed head types in same zone',
      'Zone GPM within limits',
      'Similar exposures grouped together',
      'Precipitation rates matched within zone',
    ],
  },
  {
    phase: 'pipe-routing',
    description: 'Design mainline and lateral piping network',
    tasks: [
      'Route mainline from POC through backflow device',
      'Add master valve if system >30 GPM',
      'Position valve manifolds central to served zones',
      'Size mainline for peak demand (max 5 fps velocity)',
      'Route laterals from valves to heads',
      'Size laterals based on zone GPM',
      'Add swing joints at each head',
    ],
    criticalChecks: [
      'Mainline sized for total GPM',
      'Velocity <5 fps in all pipes',
      'Valves accessible for maintenance',
      'Pipe routes avoid utilities and structures',
    ],
  },
  {
    phase: 'hydraulic-validation',
    description: 'Verify system will perform as designed',
    tasks: [
      'Calculate friction loss in mainline',
      'Calculate friction loss in each lateral',
      'Verify working pressure at farthest head',
      'Check precipitation rate uniformity',
      'Calculate estimated runtime per zone',
      'Verify total runtime fits watering window',
    ],
    criticalChecks: [
      'Pressure at farthest head meets minimum requirement',
      'Friction losses acceptable (<10% of static)',
      'Runtime fits watering window (typically 4-6 hours)',
      'Distribution uniformity >70%',
    ],
  },
];

// ============================================================================
// HEAD SELECTION MATRIX
// ============================================================================

export interface HeadSelectionCriteria {
  zoneType: 'turf' | 'bed' | 'narrow-strip' | 'tree-ring' | 'planter' | 'athletic';
  minDimension: number;
  maxDimension: number;
  preferredHead: string;
  preferredHeadId: string;
  alternatives: string[];
  reasoning: string;
}

export const HEAD_SELECTION_MATRIX: HeadSelectionCriteria[] = [
  // TURF ZONES - Large open areas
  {
    zoneType: 'turf',
    minDimension: 80,
    maxDimension: Infinity,
    preferredHead: 'Large Rotor (I-40)',
    preferredHeadId: 'i-40-04-ss',
    alternatives: ['5004-pc-sam'],
    reasoning: 'Large turf areas require high-throw rotors for efficient coverage. I-40 provides 38-72 ft radius with excellent uniformity.',
  },
  {
    zoneType: 'turf',
    minDimension: 50,
    maxDimension: 80,
    preferredHead: 'Medium Rotor (5004)',
    preferredHeadId: '5004-pc-sam',
    alternatives: ['pgp-adj'],
    reasoning: 'Medium turf panels benefit from 5004 with SAM check valve to prevent low-head drainage. 25-50 ft radius.',
  },
  {
    zoneType: 'turf',
    minDimension: 25,
    maxDimension: 50,
    preferredHead: 'Small Rotor (PGP)',
    preferredHeadId: 'pgp-adj',
    alternatives: ['mp3000'],
    reasoning: 'Smaller turf areas work well with PGP-ADJ at 22-52 ft radius. Rubber cover protects in high-traffic areas.',
  },
  {
    zoneType: 'turf',
    minDimension: 15,
    maxDimension: 25,
    preferredHead: 'Rotary Nozzle (MP3000)',
    preferredHeadId: 'mp3000',
    alternatives: ['1804-sam-prs'],
    reasoning: 'Transitional turf areas use rotary nozzles for matched precipitation with larger rotor zones.',
  },
  {
    zoneType: 'turf',
    minDimension: 0,
    maxDimension: 15,
    preferredHead: 'Fixed Spray (1804)',
    preferredHeadId: '1804-sam-prs',
    alternatives: ['mp3000'],
    reasoning: 'Small turf panels under 15 ft use fixed spray heads with SAM and PRS for consistent application.',
  },

  // BED ZONES - Landscape beds and ornamental areas
  {
    zoneType: 'bed',
    minDimension: 21,
    maxDimension: Infinity,
    preferredHead: 'Drip Emitter Line',
    preferredHeadId: 'tlcv-09-12-500',
    alternatives: ['mp3000'],
    reasoning: 'Large bed areas benefit from drip irrigation for water efficiency and reduced disease pressure.',
  },
  {
    zoneType: 'bed',
    minDimension: 8,
    maxDimension: 21,
    preferredHead: 'Rotary Nozzle (MP3000)',
    preferredHeadId: 'mp3000',
    alternatives: ['1804-sam-prs', 'tlcv-09-12-500'],
    reasoning: 'Medium beds use rotary nozzles for gentle application rate compatible with mulched surfaces.',
  },
  {
    zoneType: 'bed',
    minDimension: 0,
    maxDimension: 8,
    preferredHead: 'Strip Nozzle (HE-VAN)',
    preferredHeadId: 'he-van-15-sst',
    alternatives: ['tlcv-09-12-500'],
    reasoning: 'Narrow beds along foundations use strip nozzles for targeted coverage without building overspray.',
  },

  // NARROW STRIPS - Areas under 8 ft wide
  {
    zoneType: 'narrow-strip',
    minDimension: 0,
    maxDimension: 8,
    preferredHead: 'Strip Nozzle (HE-VAN)',
    preferredHeadId: 'he-van-15-sst',
    alternatives: ['tlcv-09-12-500'],
    reasoning: 'Narrow strips require side-throw pattern to avoid overspray. HE-VAN provides 4-15 ft adjustable throw.',
  },

  // TREE RINGS - Circular areas around trees
  {
    zoneType: 'tree-ring',
    minDimension: 0,
    maxDimension: Infinity,
    preferredHead: 'Drip Emitter Line',
    preferredHeadId: 'tlcv-09-12-500',
    alternatives: [],
    reasoning: 'Tree rings always use drip to apply water slowly to root zone without wetting trunk (disease prevention).',
  },

  // PLANTERS - Raised beds and containers
  {
    zoneType: 'planter',
    minDimension: 0,
    maxDimension: Infinity,
    preferredHead: 'Drip Emitter Line',
    preferredHeadId: 'tlcv-09-12-500',
    alternatives: [],
    reasoning: 'Planters require drip for precise water delivery and to prevent soil splash in contained areas.',
  },

  // ATHLETIC FIELDS - Special requirements
  {
    zoneType: 'athletic',
    minDimension: 0,
    maxDimension: Infinity,
    preferredHead: 'Large Rotor (I-40)',
    preferredHeadId: 'i-40-04-ss',
    alternatives: [],
    reasoning: 'Athletic fields require high-precipitation rotors (0.6+ in/hr) plus quick couplers for supplemental watering.',
  },
];

// ============================================================================
// ZONE SEPARATION PRINCIPLES
// ============================================================================

export interface ZoneSeparationRule {
  rule: string;
  requirement: 'required' | 'recommended' | 'optional';
  reasoning: string;
  implementation: string;
}

export const ZONE_SEPARATION_RULES: ZoneSeparationRule[] = [
  {
    rule: 'turf-vs-beds',
    requirement: 'required',
    reasoning: 'Turf and ornamental beds have different water requirements (ET rates). Beds typically need 50-70% of turf irrigation.',
    implementation: 'Create separate zones for all turf vs. bed areas. Never combine on same valve.',
  },
  {
    rule: 'full-sun-vs-shade',
    requirement: 'required',
    reasoning: 'Shaded areas require 50-75% less water than full-sun areas due to reduced evapotranspiration.',
    implementation: 'Map tree canopy areas. Create separate zones for shaded turf/beds.',
  },
  {
    rule: 'steep-slopes',
    requirement: 'required',
    reasoning: 'Slopes over 4:1 (25%) require lower precipitation rates to prevent runoff. Cycle-and-soak scheduling needed.',
    implementation: 'Identify slopes >4:1. Use rotary nozzles (low precip rate). Limit zone runtime to 5-10 minutes.',
  },
  {
    rule: 'head-type-separation',
    requirement: 'required',
    reasoning: 'Different head types have different precipitation rates. Mixing causes over/under watering.',
    implementation: 'Never combine rotors (0.4-0.6 in/hr) with sprays (1.5+ in/hr) in same zone.',
  },
  {
    rule: 'soil-type-separation',
    requirement: 'recommended',
    reasoning: 'Clay soils accept 0.1-0.3 in/hr, sandy soils 1.0+ in/hr. Mismatched precip rates cause runoff or deep percolation.',
    implementation: 'Where soil types vary significantly across site, create separate zones.',
  },
  {
    rule: 'plant-type-separation',
    requirement: 'recommended',
    reasoning: 'High-water plants (fescue, annuals) need more water than low-water plants (bermuda, native grasses).',
    implementation: 'Group plants by water needs (hydrozoning). Use drip for mixed plantings.',
  },
  {
    rule: 'exposure-microclimate',
    requirement: 'optional',
    reasoning: 'South/west exposures receive more heat and require more water than north/east exposures.',
    implementation: 'For large sites, consider separate zones for different building exposures.',
  },
];

// ============================================================================
// WATER CONSERVATION PRINCIPLES
// ============================================================================

export interface ConservationPrinciple {
  principle: string;
  description: string;
  implementation: string[];
  waterSavings: string;
}

export const WATER_CONSERVATION: ConservationPrinciple[] = [
  {
    principle: 'matched-precipitation',
    description: 'All heads in a zone should apply water at the same rate regardless of arc.',
    implementation: [
      'Use matched-precipitation nozzle sets (Hunter MP Rotator, Rain Bird R-VAN)',
      'Quarter-circle heads use quarter-flow nozzles',
      'Half-circle heads use half-flow nozzles',
      'Full-circle heads use full-flow nozzles',
    ],
    waterSavings: '15-25% reduction by eliminating over-watering of partial-arc heads',
  },
  {
    principle: 'head-to-head-coverage',
    description: 'Each head should throw water to the adjacent head location.',
    implementation: [
      'Space heads at manufacturer-rated radius (not diameter)',
      'Triangular spacing for large areas provides better uniformity',
      'Square spacing acceptable for rectangular areas',
      'Reduce spacing by 10% in windy locations',
    ],
    waterSavings: '10-15% by ensuring uniform coverage without gaps',
  },
  {
    principle: 'pressure-regulation',
    description: 'Maintain optimal operating pressure at each head.',
    implementation: [
      'Use pressure-regulated spray bodies (30 PSI)',
      'Use pressure-regulated rotors (45 PSI) where available',
      'Install pressure regulators at zones with high inlet pressure',
      'Consider master pressure regulator at POC if pressure exceeds 80 PSI',
    ],
    waterSavings: '10-20% by eliminating misting and fogging at high pressure',
  },
  {
    principle: 'hydrozoning',
    description: 'Group plants with similar water needs on same zones.',
    implementation: [
      'Identify plant water-use categories (high, medium, low, very low)',
      'Design zones around plant groupings',
      'Use drip irrigation for mixed plantings with varied needs',
      'Separate turf from ornamental beds',
    ],
    waterSavings: '20-50% by applying only needed water to each zone',
  },
  {
    principle: 'smart-scheduling',
    description: 'Apply water based on actual plant needs, not arbitrary schedules.',
    implementation: [
      'Use ET-based controllers that adjust for weather',
      'Install rain sensors (required in Georgia)',
      'Consider soil moisture sensors for high-value landscapes',
      'Water during low-evaporation hours (2-6 AM)',
    ],
    waterSavings: '15-30% by reducing irrigation during cool/wet periods',
  },
  {
    principle: 'low-volume-irrigation',
    description: 'Use drip and micro-irrigation where appropriate.',
    implementation: [
      'Drip for all ornamental beds, tree rings, and planters',
      'Micro-sprays for groundcover beds',
      'Subsurface drip for turf where aesthetics allow',
      'Point-source emitters for individual plants',
    ],
    waterSavings: '30-50% compared to overhead spray in bed applications',
  },
  {
    principle: 'check-valves',
    description: 'Prevent low-head drainage that wastes water and causes erosion.',
    implementation: [
      'Specify SAM (Seal-A-Matic) check valves in all spray heads',
      'Use check valve rotors on sloped sites',
      'Install at heads more than 10 ft below valve elevation',
    ],
    waterSavings: '5-10% by eliminating drainage waste after zone shutdown',
  },
];

// ============================================================================
// QUALITY STANDARDS
// ============================================================================

export interface QualityMetric {
  metric: string;
  description: string;
  minimumValue: number;
  targetValue: number;
  excellentValue: number;
  unit: string;
  measurementMethod: string;
}

export const QUALITY_STANDARDS: QualityMetric[] = [
  {
    metric: 'distribution-uniformity-low-quarter',
    description: 'DU measures how evenly water is applied across the irrigated area.',
    minimumValue: 0.55,
    targetValue: 0.70,
    excellentValue: 0.85,
    unit: 'decimal (0-1)',
    measurementMethod: 'Catch can test: DU = (avg of lowest 25% of catches) / (overall average)',
  },
  {
    metric: 'scheduling-coefficient',
    description: 'SC indicates how much extra water needed to adequately irrigate dry spots.',
    minimumValue: 1.0,
    targetValue: 1.2,
    excellentValue: 1.1,
    unit: 'multiplier',
    measurementMethod: 'SC = (minimum catch required) / (average catch). Lower is better.',
  },
  {
    metric: 'head-to-head-overlap',
    description: 'Percentage of throw radius that reaches adjacent heads.',
    minimumValue: 90,
    targetValue: 100,
    excellentValue: 100,
    unit: 'percent',
    measurementMethod: 'Verify spacing ≤ manufacturer-rated radius at operating pressure.',
  },
  {
    metric: 'precipitation-rate-uniformity',
    description: 'Consistency of application rate across all heads in a zone.',
    minimumValue: 0.80,
    targetValue: 0.95,
    excellentValue: 1.0,
    unit: 'ratio (lowest/highest)',
    measurementMethod: 'Compare precipitation rates of all heads in zone. Use matched-precip nozzles.',
  },
  {
    metric: 'operating-pressure-consistency',
    description: 'Pressure variation between first and last head on lateral.',
    minimumValue: -20,
    targetValue: -10,
    excellentValue: -5,
    unit: 'percent variation',
    measurementMethod: 'Calculate pressure loss through lateral. Keep within 10% of design pressure.',
  },
];

// ============================================================================
// PRECIPITATION RATE LIMITS BY SOIL TYPE
// ============================================================================

export interface SoilPrecipLimit {
  soilType: 'clay' | 'clay-loam' | 'loam' | 'sandy-loam' | 'sand';
  maxPrecipRate: number;
  description: string;
  cycleAndSoakRequired: boolean;
  typicalRuntime: number;
  soakTime: number;
}

export const SOIL_PRECIPITATION_LIMITS: SoilPrecipLimit[] = [
  {
    soilType: 'clay',
    maxPrecipRate: 0.1,
    description: 'Heavy clay with very slow infiltration. Common in Georgia piedmont.',
    cycleAndSoakRequired: true,
    typicalRuntime: 5,
    soakTime: 30,
  },
  {
    soilType: 'clay-loam',
    maxPrecipRate: 0.3,
    description: 'Mixed clay with some loam. Moderate infiltration.',
    cycleAndSoakRequired: true,
    typicalRuntime: 10,
    soakTime: 20,
  },
  {
    soilType: 'loam',
    maxPrecipRate: 0.5,
    description: 'Balanced soil with good infiltration. Ideal for most plants.',
    cycleAndSoakRequired: false,
    typicalRuntime: 15,
    soakTime: 0,
  },
  {
    soilType: 'sandy-loam',
    maxPrecipRate: 0.8,
    description: 'Sandy soil with rapid infiltration. Common in coastal areas.',
    cycleAndSoakRequired: false,
    typicalRuntime: 20,
    soakTime: 0,
  },
  {
    soilType: 'sand',
    maxPrecipRate: 1.5,
    description: 'Pure sand with very rapid infiltration. Risk of deep percolation.',
    cycleAndSoakRequired: false,
    typicalRuntime: 10,
    soakTime: 0,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Select the appropriate head type based on zone characteristics
 */
export function selectHeadFromKnowledge(
  zoneType: 'turf' | 'bed' | 'narrow-strip' | 'tree-ring' | 'planter',
  maxDimension: number,
  isAthleticField: boolean = false
): HeadSelectionCriteria | undefined {
  if (isAthleticField) {
    return HEAD_SELECTION_MATRIX.find(h => h.zoneType === 'athletic');
  }

  return HEAD_SELECTION_MATRIX.find(
    h => h.zoneType === zoneType && maxDimension >= h.minDimension && maxDimension < h.maxDimension
  );
}

/**
 * Get maximum precipitation rate for soil type
 */
export function getMaxPrecipRate(soilType: string): number {
  const soil = SOIL_PRECIPITATION_LIMITS.find(s => s.soilType === soilType);
  return soil?.maxPrecipRate ?? 0.5; // Default to loam
}

/**
 * Check if cycle-and-soak is needed
 */
export function needsCycleAndSoak(soilType: string): boolean {
  const soil = SOIL_PRECIPITATION_LIMITS.find(s => s.soilType === soilType);
  return soil?.cycleAndSoakRequired ?? false;
}

/**
 * Get zone separation rules by requirement level
 */
export function getRequiredSeparationRules(): ZoneSeparationRule[] {
  return ZONE_SEPARATION_RULES.filter(r => r.requirement === 'required');
}

/**
 * Get all conservation principles for AI context
 */
export function getConservationContext(): string {
  return WATER_CONSERVATION.map(
    c => `${c.principle}: ${c.description} (${c.waterSavings})`
  ).join('\n');
}

/**
 * Get design methodology as structured text for AI prompts
 */
export function getDesignMethodologyContext(): string {
  return DESIGN_METHODOLOGY.map(
    phase => `Phase: ${phase.phase}\n${phase.description}\nTasks:\n${phase.tasks.map(t => `- ${t}`).join('\n')}\nCritical Checks:\n${phase.criticalChecks.map(c => `- ${c}`).join('\n')}`
  ).join('\n\n');
}
