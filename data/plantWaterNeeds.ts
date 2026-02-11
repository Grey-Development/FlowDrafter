/**
 * FlowDrafter Plant Water Needs Data
 *
 * Evapotranspiration rates, soil characteristics, and scheduling data
 * for Southeast US (Georgia/Atlanta metro area)
 *
 * Reference: University of Georgia Cooperative Extension,
 * Georgia Environmental Protection Division
 */

// ============================================================================
// TURF GRASS SPECIFICATIONS
// ============================================================================

export interface TurfSpec {
  id: string;
  commonName: string;
  scientificName: string;
  type: 'warm-season' | 'cool-season';
  peakETInPerDay: number;
  weeklyWaterNeedIn: number;
  droughtTolerance: 'high' | 'medium' | 'low';
  shadeTolerance: 'high' | 'medium' | 'low';
  mowingHeightIn: number;
  rootDepthIn: number;
  dormancyPeriod: string;
  bestRegions: string[];
  notes: string[];
}

export const TURF_SPECIES: TurfSpec[] = [
  {
    id: 'bermudagrass',
    commonName: 'Bermudagrass',
    scientificName: 'Cynodon dactylon',
    type: 'warm-season',
    peakETInPerDay: 0.25,
    weeklyWaterNeedIn: 1.0,
    droughtTolerance: 'high',
    shadeTolerance: 'low',
    mowingHeightIn: 1.5,
    rootDepthIn: 6,
    dormancyPeriod: 'November-March (browns out)',
    bestRegions: ['Southeast', 'Southwest', 'Transition Zone'],
    notes: [
      'Most drought-tolerant warm-season grass',
      'Requires full sun (8+ hours)',
      'Aggressive spreader - keep out of beds',
      'Can reduce irrigation 40-50% and survive',
    ],
  },
  {
    id: 'zoysia',
    commonName: 'Zoysiagrass',
    scientificName: 'Zoysia japonica',
    type: 'warm-season',
    peakETInPerDay: 0.20,
    weeklyWaterNeedIn: 0.8,
    droughtTolerance: 'high',
    shadeTolerance: 'medium',
    mowingHeightIn: 2.0,
    rootDepthIn: 6,
    dormancyPeriod: 'November-April (browns out)',
    bestRegions: ['Southeast', 'Transition Zone'],
    notes: [
      'Very dense turf resists weeds',
      'Tolerates partial shade (4-6 hours sun)',
      'Slow to establish',
      'Lower water needs than bermuda',
    ],
  },
  {
    id: 'centipedegrass',
    commonName: 'Centipedegrass',
    scientificName: 'Eremochloa ophiuroides',
    type: 'warm-season',
    peakETInPerDay: 0.18,
    weeklyWaterNeedIn: 0.75,
    droughtTolerance: 'medium',
    shadeTolerance: 'medium',
    mowingHeightIn: 2.5,
    rootDepthIn: 4,
    dormancyPeriod: 'November-April',
    bestRegions: ['Southeast coastal plain'],
    notes: [
      'Lowest maintenance warm-season grass',
      'Low nitrogen requirement',
      'Poor traffic tolerance',
      'Prefers acidic soil',
    ],
  },
  {
    id: 'st-augustine',
    commonName: 'St. Augustinegrass',
    scientificName: 'Stenotaphrum secundatum',
    type: 'warm-season',
    peakETInPerDay: 0.30,
    weeklyWaterNeedIn: 1.25,
    droughtTolerance: 'low',
    shadeTolerance: 'high',
    mowingHeightIn: 3.5,
    rootDepthIn: 6,
    dormancyPeriod: 'November-March',
    bestRegions: ['Southeast coastal', 'Gulf Coast'],
    notes: [
      'Best shade tolerance of warm-season grasses',
      'Higher water requirement',
      'Susceptible to chinch bugs',
      'Coarse texture',
    ],
  },
  {
    id: 'fescue',
    commonName: 'Tall Fescue',
    scientificName: 'Festuca arundinacea',
    type: 'cool-season',
    peakETInPerDay: 0.20,
    weeklyWaterNeedIn: 1.25,
    droughtTolerance: 'medium',
    shadeTolerance: 'high',
    mowingHeightIn: 3.5,
    rootDepthIn: 12,
    dormancyPeriod: 'None (evergreen)',
    bestRegions: ['Transition Zone', 'Upper Southeast'],
    notes: [
      'Only cool-season grass viable in North Georgia',
      'Requires supplemental irrigation in summer',
      'Deep roots help drought tolerance',
      'May thin in extreme summer heat',
    ],
  },
];

// ============================================================================
// EVAPOTRANSPIRATION DATA - ATLANTA METRO
// ============================================================================

export interface MonthlyETData {
  month: string;
  avgHighTempF: number;
  avgLowTempF: number;
  avgRainfallIn: number;
  avgETInPerDay: number;
  irrigationNeededIn: number;
  notes: string;
}

export const ATLANTA_ET_DATA: MonthlyETData[] = [
  {
    month: 'January',
    avgHighTempF: 52,
    avgLowTempF: 34,
    avgRainfallIn: 4.5,
    avgETInPerDay: 0.05,
    irrigationNeededIn: 0,
    notes: 'Dormant season, no irrigation needed',
  },
  {
    month: 'February',
    avgHighTempF: 56,
    avgLowTempF: 37,
    avgRainfallIn: 4.5,
    irrigationNeededIn: 0,
    avgETInPerDay: 0.07,
    notes: 'Dormant season, no irrigation needed',
  },
  {
    month: 'March',
    avgHighTempF: 64,
    avgLowTempF: 44,
    avgRainfallIn: 5.0,
    avgETInPerDay: 0.12,
    irrigationNeededIn: 0.5,
    notes: 'Green-up begins, light irrigation if dry',
  },
  {
    month: 'April',
    avgHighTempF: 72,
    avgLowTempF: 51,
    avgRainfallIn: 3.5,
    avgETInPerDay: 0.18,
    irrigationNeededIn: 1.0,
    notes: 'Active growth, begin regular irrigation',
  },
  {
    month: 'May',
    avgHighTempF: 80,
    avgLowTempF: 60,
    avgRainfallIn: 4.0,
    avgETInPerDay: 0.22,
    irrigationNeededIn: 1.25,
    notes: 'Increasing water demand',
  },
  {
    month: 'June',
    avgHighTempF: 87,
    avgLowTempF: 68,
    avgRainfallIn: 3.8,
    avgETInPerDay: 0.25,
    irrigationNeededIn: 1.5,
    notes: 'Peak growth, high water demand',
  },
  {
    month: 'July',
    avgHighTempF: 90,
    avgLowTempF: 71,
    avgRainfallIn: 5.0,
    avgETInPerDay: 0.28,
    irrigationNeededIn: 1.5,
    notes: 'Peak ET, highest irrigation demand',
  },
  {
    month: 'August',
    avgHighTempF: 88,
    avgLowTempF: 70,
    avgRainfallIn: 3.8,
    avgETInPerDay: 0.26,
    irrigationNeededIn: 1.5,
    notes: 'Continued high demand, watch for drought stress',
  },
  {
    month: 'September',
    avgHighTempF: 82,
    avgLowTempF: 64,
    avgRainfallIn: 4.0,
    avgETInPerDay: 0.20,
    irrigationNeededIn: 1.0,
    notes: 'Reducing demand, prepare for fall',
  },
  {
    month: 'October',
    avgHighTempF: 72,
    avgLowTempF: 53,
    avgRainfallIn: 3.0,
    avgETInPerDay: 0.14,
    irrigationNeededIn: 0.75,
    notes: 'Cool-season overseed time if applicable',
  },
  {
    month: 'November',
    avgHighTempF: 62,
    avgLowTempF: 43,
    avgRainfallIn: 3.5,
    avgETInPerDay: 0.08,
    irrigationNeededIn: 0.25,
    notes: 'Warm-season grasses entering dormancy',
  },
  {
    month: 'December',
    avgHighTempF: 53,
    avgLowTempF: 36,
    avgRainfallIn: 4.0,
    avgETInPerDay: 0.05,
    irrigationNeededIn: 0,
    notes: 'Dormant season, no irrigation needed',
  },
];

// ============================================================================
// SOIL CHARACTERISTICS
// ============================================================================

export interface SoilSpec {
  type: string;
  infiltrationRateInPerHr: number;
  availableWaterIn: number;
  fieldCapacity: number;
  wiltingPoint: number;
  commonLocations: string[];
  irrigationNotes: string[];
}

export const SOIL_TYPES: SoilSpec[] = [
  {
    type: 'clay',
    infiltrationRateInPerHr: 0.1,
    availableWaterIn: 1.5,
    fieldCapacity: 0.40,
    wiltingPoint: 0.20,
    commonLocations: ['Georgia Piedmont', 'Metro Atlanta', 'North Georgia'],
    irrigationNotes: [
      'Very slow infiltration - use cycle & soak',
      'Limit runtime to 5-10 minutes per cycle',
      'Wait 30+ minutes between cycles',
      'Use rotary nozzles or drip (low precip rate)',
      'Runoff is common - avoid slopes',
    ],
  },
  {
    type: 'clay-loam',
    infiltrationRateInPerHr: 0.3,
    availableWaterIn: 1.75,
    fieldCapacity: 0.35,
    wiltingPoint: 0.15,
    commonLocations: ['Transition areas', 'Amended soils'],
    irrigationNotes: [
      'Moderate infiltration',
      'Limit runtime to 15 minutes per cycle',
      'Wait 20 minutes between cycles if needed',
      'Most head types work well',
    ],
  },
  {
    type: 'loam',
    infiltrationRateInPerHr: 0.5,
    availableWaterIn: 2.0,
    fieldCapacity: 0.30,
    wiltingPoint: 0.12,
    commonLocations: ['Ideal landscape soil', 'Imported topsoil'],
    irrigationNotes: [
      'Ideal infiltration rate',
      'Can run longer cycles (20+ minutes)',
      'All head types work well',
      'Best water-holding capacity',
    ],
  },
  {
    type: 'sandy-loam',
    infiltrationRateInPerHr: 0.8,
    availableWaterIn: 1.25,
    fieldCapacity: 0.22,
    wiltingPoint: 0.08,
    commonLocations: ['Coastal Plain', 'South Georgia'],
    irrigationNotes: [
      'Fast infiltration',
      'More frequent, shorter irrigation cycles',
      'Water moves quickly past roots',
      'May need twice-weekly irrigation in summer',
    ],
  },
  {
    type: 'sand',
    infiltrationRateInPerHr: 1.5,
    availableWaterIn: 0.75,
    fieldCapacity: 0.15,
    wiltingPoint: 0.05,
    commonLocations: ['Beach areas', 'Dune soils'],
    irrigationNotes: [
      'Very fast drainage',
      'Low water-holding capacity',
      'Frequent light irrigation needed',
      'Risk of leaching nutrients',
    ],
  },
];

// ============================================================================
// HYDROZONING CATEGORIES
// ============================================================================

export interface HydrozoneCategory {
  zone: string;
  waterUseLevel: 'very-low' | 'low' | 'moderate' | 'high';
  percentOfTurf: number;
  typicalPlants: string[];
  irrigationType: string;
  description: string;
}

export const HYDROZONES: HydrozoneCategory[] = [
  {
    zone: 'oasis',
    waterUseLevel: 'high',
    percentOfTurf: 100,
    typicalPlants: ['Turf lawns', 'Annuals', 'Tropical plants', 'Vegetables'],
    irrigationType: 'Spray heads or rotors',
    description: 'High-visibility areas requiring regular irrigation to maintain appearance',
  },
  {
    zone: 'transition',
    waterUseLevel: 'moderate',
    percentOfTurf: 50,
    typicalPlants: ['Ornamental shrubs', 'Perennials', 'Groundcovers'],
    irrigationType: 'Drip or low-volume spray',
    description: 'Established ornamental areas needing supplemental water',
  },
  {
    zone: 'drought-tolerant',
    waterUseLevel: 'low',
    percentOfTurf: 25,
    typicalPlants: ['Native shrubs', 'Ornamental grasses', 'Succulents'],
    irrigationType: 'Drip only or no irrigation',
    description: 'Adapted plants needing minimal supplemental irrigation once established',
  },
  {
    zone: 'natural',
    waterUseLevel: 'very-low',
    percentOfTurf: 0,
    typicalPlants: ['Native trees', 'Native shrubs', 'Meadow grasses'],
    irrigationType: 'Establishment only or none',
    description: 'Native plantings that survive on rainfall after establishment',
  },
];

// ============================================================================
// SCHEDULING ADJUSTMENTS
// ============================================================================

export interface ScheduleAdjustment {
  factor: string;
  condition: string;
  adjustment: number;
  notes: string;
}

export const SCHEDULE_ADJUSTMENTS: ScheduleAdjustment[] = [
  // Exposure adjustments
  { factor: 'exposure', condition: 'full-shade', adjustment: 0.50, notes: 'Reduce by 50% for full shade' },
  { factor: 'exposure', condition: 'partial-shade', adjustment: 0.75, notes: 'Reduce by 25% for partial shade' },
  { factor: 'exposure', condition: 'full-sun', adjustment: 1.0, notes: 'No adjustment for full sun' },
  { factor: 'exposure', condition: 'reflected-heat', adjustment: 1.25, notes: 'Increase 25% near buildings/pavement' },

  // Slope adjustments
  { factor: 'slope', condition: 'flat', adjustment: 1.0, notes: 'No adjustment for flat areas' },
  { factor: 'slope', condition: 'gentle (2-4%)', adjustment: 0.90, notes: 'Slight reduction for gentle slopes' },
  { factor: 'slope', condition: 'moderate (4-8%)', adjustment: 0.75, notes: 'Use cycle & soak, reduce runtime' },
  { factor: 'slope', condition: 'steep (>8%)', adjustment: 0.50, notes: 'Drip preferred, short cycles only' },

  // Soil adjustments
  { factor: 'soil', condition: 'clay', adjustment: 0.80, notes: 'Apply less, more frequently' },
  { factor: 'soil', condition: 'loam', adjustment: 1.0, notes: 'Standard application' },
  { factor: 'soil', condition: 'sand', adjustment: 1.20, notes: 'Apply more frequently, slightly more total' },

  // Season adjustments (relative to peak)
  { factor: 'season', condition: 'winter', adjustment: 0.0, notes: 'No irrigation during dormancy' },
  { factor: 'season', condition: 'spring', adjustment: 0.50, notes: '50% of peak demand' },
  { factor: 'season', condition: 'summer', adjustment: 1.0, notes: 'Peak demand' },
  { factor: 'season', condition: 'fall', adjustment: 0.40, notes: '40% of peak demand' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get turf species by ID
 */
export function getTurfSpec(turfId: string): TurfSpec | undefined {
  return TURF_SPECIES.find(t => t.id === turfId);
}

/**
 * Get soil specifications by type
 */
export function getSoilSpec(soilType: string): SoilSpec | undefined {
  return SOIL_TYPES.find(s => s.type === soilType);
}

/**
 * Calculate weekly water need for a turf type in a given month
 */
export function calculateWeeklyWaterNeed(
  turfId: string,
  month: string,
  exposure: 'full-sun' | 'partial-shade' | 'full-shade' = 'full-sun'
): number {
  const turf = getTurfSpec(turfId);
  const monthData = ATLANTA_ET_DATA.find(m => m.month === month);
  if (!turf || !monthData) return 0;

  // Start with base weekly need
  let weeklyNeed = turf.weeklyWaterNeedIn;

  // Adjust for month (ratio of month ET to peak ET)
  const peakET = Math.max(...ATLANTA_ET_DATA.map(m => m.avgETInPerDay));
  const monthRatio = monthData.avgETInPerDay / peakET;
  weeklyNeed *= monthRatio;

  // Adjust for exposure
  const exposureAdj = SCHEDULE_ADJUSTMENTS.find(a => a.factor === 'exposure' && a.condition === exposure);
  if (exposureAdj) {
    weeklyNeed *= exposureAdj.adjustment;
  }

  return Math.round(weeklyNeed * 100) / 100;
}

/**
 * Calculate irrigation runtime for a zone
 */
export function calculateRuntime(params: {
  precipitationRateInPerHr: number;
  weeklyWaterNeedIn: number;
  soilType: string;
  daysPerWeek: number;
}): { runtimeMinutes: number; cycles: number; cycleMinutes: number; soakMinutes: number } {
  const soil = getSoilSpec(params.soilType);
  if (!soil) {
    return { runtimeMinutes: 0, cycles: 1, cycleMinutes: 0, soakMinutes: 0 };
  }

  // Calculate total runtime needed per watering day
  const waterPerDay = params.weeklyWaterNeedIn / params.daysPerWeek;
  const totalRuntimeHours = waterPerDay / params.precipitationRateInPerHr;
  const totalRuntimeMinutes = Math.round(totalRuntimeHours * 60);

  // Check if cycle & soak is needed
  if (params.precipitationRateInPerHr > soil.infiltrationRateInPerHr) {
    // Precip rate exceeds infiltration - need cycle & soak
    const maxCycleMinutes = Math.floor((soil.infiltrationRateInPerHr / params.precipitationRateInPerHr) * 60 * 0.8); // 80% safety factor
    const cycles = Math.ceil(totalRuntimeMinutes / maxCycleMinutes);
    const cycleMinutes = Math.ceil(totalRuntimeMinutes / cycles);

    // Soak time based on soil type
    let soakMinutes = 20;
    if (params.soilType === 'clay') soakMinutes = 30;
    if (params.soilType === 'clay-loam') soakMinutes = 20;
    if (params.soilType === 'loam') soakMinutes = 15;

    return {
      runtimeMinutes: totalRuntimeMinutes,
      cycles,
      cycleMinutes,
      soakMinutes,
    };
  }

  // No cycle & soak needed
  return {
    runtimeMinutes: totalRuntimeMinutes,
    cycles: 1,
    cycleMinutes: totalRuntimeMinutes,
    soakMinutes: 0,
  };
}

/**
 * Get peak ET for a turf type (used for worst-case design)
 */
export function getPeakET(turfId: string): number {
  const turf = getTurfSpec(turfId);
  return turf?.peakETInPerDay ?? 0.25;
}

/**
 * Determine if irrigation is needed in a given month
 */
export function isIrrigationNeeded(month: string): boolean {
  const monthData = ATLANTA_ET_DATA.find(m => m.month === month);
  return (monthData?.irrigationNeededIn ?? 0) > 0;
}

/**
 * Get recommended watering days per week
 */
export function getRecommendedWateringDays(turfId: string, soilType: string, month: string): number {
  const soil = getSoilSpec(soilType);
  const monthData = ATLANTA_ET_DATA.find(m => m.month === month);

  if (!soil || !monthData || monthData.irrigationNeededIn === 0) return 0;

  // Sandy soils need more frequent watering
  if (soil.type === 'sand' || soil.type === 'sandy-loam') {
    return monthData.irrigationNeededIn > 1 ? 3 : 2;
  }

  // Clay soils prefer less frequent, deeper watering
  if (soil.type === 'clay') {
    return monthData.irrigationNeededIn > 1 ? 2 : 1;
  }

  // Default for loam
  return monthData.irrigationNeededIn > 1.25 ? 3 : 2;
}

/**
 * Get scheduling context for AI prompts
 */
export function getSchedulingContext(turfId: string, soilType: string): string {
  const turf = getTurfSpec(turfId);
  const soil = getSoilSpec(soilType);

  if (!turf || !soil) return '';

  return `Turf: ${turf.commonName}
- Peak ET: ${turf.peakETInPerDay} in/day
- Weekly need: ${turf.weeklyWaterNeedIn} inches
- Root depth: ${turf.rootDepthIn} inches
- Drought tolerance: ${turf.droughtTolerance}

Soil: ${soil.type}
- Infiltration rate: ${soil.infiltrationRateInPerHr} in/hr
- Available water: ${soil.availableWaterIn} inches
${soil.irrigationNotes.map(n => `- ${n}`).join('\n')}

Recommendation: ${
    soil.infiltrationRateInPerHr < 0.3
      ? 'Use cycle & soak scheduling. Max runtime 5-10 min per cycle.'
      : 'Standard scheduling acceptable.'
  }`;
}
