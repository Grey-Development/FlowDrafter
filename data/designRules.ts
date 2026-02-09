export const DESIGN_RULES = {
  headToHead: {
    description: 'Every head spaced so throw radius reaches adjacent head',
    maxSpacing: 'manufacturer rated radius',
  },
  matchedPrecip: {
    noMixingRotorsAndSprays: true,
    mixedArcsOkWithMatchedNozzles: true,
    matchedNozzleSets: ['Hunter MP Rotator', 'Rain Bird R-VAN'],
  },
  zoneSeparation: {
    separateTurfFromBeds: true,
    separateExposures: ['full-sun turf', 'shaded turf', 'slopes > 4:1', 'ornamental beds'],
    requireIndependentZoneControl: true,
  },
  hydraulics: {
    maxGPMPerZone1inLateral: 15,
    maxGPMPerZone1_25inLateral: 22,
    maxPipeVelocityFPS: 5,
  },
  pipeSizing: {
    mainline: {
      under40GPM: { sizeIn: 1.5, material: 'Sch. 40 PVC' },
      from40to80GPM: { sizeIn: 2, material: 'Sch. 40 PVC' },
    },
    lateral: {
      rotorZones: { sizeIn: 1, material: 'Class 200 PVC' },
      sprayZones: { sizeIn: 0.75, material: 'Class 200 PVC' },
    },
    swingJoint: { minLengthIn: 6, required: true },
  },
  layoutPatterns: {
    rectangular: {
      pattern: 'square',
      spacingRule: 'nozzle radius',
      cornersFirst: true,
      thenPerimeter: true,
      thenInterior: true,
    },
    irregular: {
      cornersFirst: true,
      fillPerimeter: true,
      addInterior: true,
      narrowStripThresholdFt: 8,
    },
    athleticField: {
      pattern: 'triangular-offset',
      minPrecipRate: 0.6,
      quickCouplersRequired: true,
      quickCouplerLocations: ['midfield', 'each 18-yard line'],
    },
  },
  controllerPlacement: {
    adjacentToNearestBuilding: true,
    nearWaterSource: true,
  },
  valvePlacement: {
    maxValvesPerJumboBox: 4,
    maxValvesPerRectBox: 6,
    centralToServedZones: true,
  },
  backflow: {
    rpzRequired: true,
    stateRequirement: 'Georgia EPD',
    masterValve: {
      requiredAboveGPM: 30,
      location: 'downstream of RPZ, upstream of all zone valves',
    },
  },
  drip: {
    pressureRegulatorPSI: 30,
    filterMesh: 150,
    airVacuumReliefRequired: true,
    emitterSpacing: {
      groundcoverBeds: 12,
      shrubBeds: 18,
    },
    separateZones: true,
  },
  climate: {
    peakET: {
      bermudagrass: 0.25,
      fescue: 0.20,
    },
    weeklyApplicationMin: 1.25,
    peakMonths: ['July', 'August'],
    winterizationRequired: false,
    zone: '7b/8a',
    sensorRequired: true,
    sensorRequirement: 'Georgia Water Stewardship Act',
  },
};

export const SCALE_RULES = {
  under2Acres: { scale: 30, label: '1" = 30\'' },
  from2to5Acres: { scale: 50, label: '1" = 50\'' },
  over5Acres: { scale: 100, label: '1" = 100\'' },
};

export function getScaleForAcreage(acres: number): { scale: number; label: string } {
  if (acres < 2) return SCALE_RULES.under2Acres;
  if (acres <= 5) return SCALE_RULES.from2to5Acres;
  return SCALE_RULES.over5Acres;
}

export function getMainlineSizeIn(totalGPM: number): number {
  return totalGPM >= 40 ? 2 : 1.5;
}

export function getLateralSizeIn(headType: 'rotor' | 'spray' | 'rotary-nozzle' | 'drip' | 'strip'): number {
  if (headType === 'rotor') return 1;
  return 0.75;
}

export function needsMasterValve(totalGPM: number): boolean {
  return totalGPM > 30;
}

export function getMaxGPMForLateral(lateralSizeIn: number): number {
  if (lateralSizeIn >= 1.25) return 22;
  return 15;
}

export function calculatePipeVelocity(gpm: number, diameterIn: number): number {
  const areaFt2 = Math.PI * Math.pow(diameterIn / 24, 2);
  const flowCFS = gpm / 448.831;
  return flowCFS / areaFt2;
}
