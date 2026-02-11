/**
 * FlowDrafter Regional Requirements
 *
 * Regulatory requirements, water restrictions, and compliance standards
 * for Southeast US with focus on Georgia/Atlanta metro area
 *
 * Reference: Georgia Environmental Protection Division,
 * Metropolitan North Georgia Water Planning District
 */

// ============================================================================
// GEORGIA WATER STEWARDSHIP ACT
// ============================================================================

export interface WaterStewardshipRequirement {
  requirement: string;
  description: string;
  applicability: string;
  enforcement: string;
  effectiveDate: string;
}

export const GEORGIA_WATER_STEWARDSHIP_ACT: WaterStewardshipRequirement[] = [
  {
    requirement: 'rain-sensor-required',
    description: 'All automatic irrigation systems must have a rain sensor or soil moisture sensor',
    applicability: 'All new installations and major renovations in Georgia',
    enforcement: 'Required for certificate of occupancy',
    effectiveDate: 'January 1, 2010',
  },
  {
    requirement: 'odd-even-watering',
    description: 'Outdoor watering restricted to odd/even days based on address',
    applicability: 'Metro Atlanta area (during drought conditions)',
    enforcement: 'Varies by county - fines up to $1,000',
    effectiveDate: 'Implemented during drought emergencies',
  },
  {
    requirement: 'time-of-day-restriction',
    description: 'Watering prohibited 10 AM - 4 PM during drought conditions',
    applicability: 'Metro Atlanta area',
    enforcement: 'County-level enforcement',
    effectiveDate: 'During declared drought conditions',
  },
  {
    requirement: 'new-landscape-watering',
    description: 'New landscapes may water any day for 30 days to establish',
    applicability: 'Newly installed landscapes',
    enforcement: 'Must post permit/sign',
    effectiveDate: 'Ongoing',
  },
  {
    requirement: 'drip-exemption',
    description: 'Drip irrigation and hand watering may occur any time',
    applicability: 'All Georgia residents',
    enforcement: 'N/A - exemption',
    effectiveDate: 'Ongoing',
  },
];

// ============================================================================
// BACKFLOW PREVENTION REQUIREMENTS
// ============================================================================

export interface BackflowRequirement {
  jurisdiction: string;
  deviceType: 'RPZ' | 'DCVA' | 'PVB' | 'AVB';
  fullName: string;
  required: boolean;
  testingFrequency: string;
  installationNotes: string[];
}

export const BACKFLOW_REQUIREMENTS: BackflowRequirement[] = [
  {
    jurisdiction: 'Georgia EPD',
    deviceType: 'RPZ',
    fullName: 'Reduced Pressure Zone Backflow Preventer',
    required: true,
    testingFrequency: 'Annual testing required by certified tester',
    installationNotes: [
      'Required for all commercial irrigation connections',
      'Must be installed above grade',
      'Relief valve must drain to atmosphere (not into soil)',
      'Minimum 12 inches above grade',
      'Must be accessible for annual testing',
    ],
  },
  {
    jurisdiction: 'Metro Atlanta Counties',
    deviceType: 'DCVA',
    fullName: 'Double Check Valve Assembly',
    required: false,
    testingFrequency: 'Annual testing required',
    installationNotes: [
      'May be allowed for low-hazard residential applications',
      'Check with local water authority',
      'Cannot be used where chemicals are injected',
    ],
  },
  {
    jurisdiction: 'Residential (some counties)',
    deviceType: 'PVB',
    fullName: 'Pressure Vacuum Breaker',
    required: false,
    testingFrequency: 'Annual testing recommended',
    installationNotes: [
      'Must be installed 12 inches above highest head',
      'Cannot be used with check valves downstream',
      'Not suitable for systems with back pressure',
      'Least expensive option where allowed',
    ],
  },
];

// ============================================================================
// COUNTY-SPECIFIC WATER RESTRICTIONS
// ============================================================================

export interface CountyRestriction {
  county: string;
  waterProvider: string;
  wateringDays: string;
  wateringHours: string;
  droughtLevel: string;
  restrictions: string[];
  contactInfo: string;
}

export const METRO_ATLANTA_RESTRICTIONS: CountyRestriction[] = [
  {
    county: 'Fulton',
    waterProvider: 'Atlanta Watershed / Fulton County',
    wateringDays: 'Odd addresses: Tu/Th/Sat, Even: Mon/Wed/Fri',
    wateringHours: 'Before 10 AM or after 4 PM',
    droughtLevel: 'Normal - Level 1',
    restrictions: [
      'No watering between 10 AM - 4 PM',
      'Automatic irrigation limited to 3 days per week',
      'Rain sensor required on all systems',
    ],
    contactInfo: 'Atlanta Watershed: 404-546-3500',
  },
  {
    county: 'Cobb',
    waterProvider: 'Cobb County Water System',
    wateringDays: 'Odd addresses: Tu/Th/Sat, Even: Mon/Wed/Fri',
    wateringHours: 'Midnight - 10 AM',
    droughtLevel: 'Normal',
    restrictions: [
      'Automatic systems: Midnight - 10 AM only',
      'Manual watering: Any time',
      'Rain sensor required',
    ],
    contactInfo: 'Cobb County Water: 770-423-1000',
  },
  {
    county: 'DeKalb',
    waterProvider: 'DeKalb County Watershed',
    wateringDays: 'Odd addresses: Tu/Th/Sat, Even: Mon/Wed/Fri',
    wateringHours: 'Before 10 AM or after 4 PM',
    droughtLevel: 'Normal',
    restrictions: [
      'Odd/even watering schedule',
      'Time-of-day restrictions',
      'Rain sensor required for new installations',
    ],
    contactInfo: 'DeKalb Watershed: 770-621-7200',
  },
  {
    county: 'Gwinnett',
    waterProvider: 'Gwinnett County Water Resources',
    wateringDays: 'Odd addresses: Tu/Th/Sat, Even: Mon/Wed/Fri',
    wateringHours: '4 PM - 10 AM',
    droughtLevel: 'Normal',
    restrictions: [
      'Year-round odd/even schedule',
      'Automatic systems must operate 4 PM - 10 AM',
      'Rain/soil moisture sensor required',
    ],
    contactInfo: 'Gwinnett Water: 678-376-6900',
  },
];

// ============================================================================
// PERMITTING REQUIREMENTS
// ============================================================================

export interface PermitRequirement {
  category: string;
  requirement: string;
  applicability: string;
  processTime: string;
  estimatedCost: string;
  notes: string[];
}

export const PERMIT_REQUIREMENTS: PermitRequirement[] = [
  {
    category: 'Water Meter Permit',
    requirement: 'Separate irrigation meter (optional but recommended)',
    applicability: 'Commercial properties, large residential',
    processTime: '2-4 weeks',
    estimatedCost: '$200-500 (meter installation)',
    notes: [
      'Avoids sewer charges on irrigation water',
      'Requires backflow prevention regardless',
      'Contact water provider for meter availability',
    ],
  },
  {
    category: 'Backflow Test Report',
    requirement: 'Annual backflow prevention test',
    applicability: 'All commercial irrigation, most residential',
    processTime: 'Same day testing, report filed within 10 days',
    estimatedCost: '$75-150 per test',
    notes: [
      'Must be performed by Georgia-certified tester',
      'Report filed with local water authority',
      'Failed devices must be repaired and retested',
    ],
  },
  {
    category: 'Irrigation License',
    requirement: 'Georgia Irrigation Contractor License',
    applicability: 'Contractors installing irrigation systems',
    processTime: 'N/A (contractor requirement)',
    estimatedCost: 'N/A',
    notes: [
      'Verify contractor holds valid GCIC license',
      'License number should appear on contract',
      'Check at: sos.ga.gov/corporations',
    ],
  },
];

// ============================================================================
// DESIGN CODE REQUIREMENTS
// ============================================================================

export interface DesignCodeRequirement {
  code: string;
  requirement: string;
  specification: string;
  reference: string;
}

export const DESIGN_CODE_REQUIREMENTS: DesignCodeRequirement[] = [
  // Burial depth
  {
    code: 'pipe-burial-depth',
    requirement: 'Minimum pipe burial depth',
    specification: '12 inches below finished grade (6 inches in Georgia due to mild winters)',
    reference: 'IA BMPs, local codes',
  },
  {
    code: 'wire-burial-depth',
    requirement: 'Control wire burial depth',
    specification: '6-8 inches minimum, same trench as pipe acceptable',
    reference: 'NEC, local codes',
  },
  {
    code: 'valve-box-accessibility',
    requirement: 'Valve box placement',
    specification: 'Must be accessible for maintenance, not in traffic areas',
    reference: 'IA BMPs',
  },
  {
    code: 'controller-location',
    requirement: 'Controller placement',
    specification: 'Weatherproof outdoor enclosure or indoor mounting, GFCI outlet required',
    reference: 'NEC Article 680.58',
  },
  {
    code: 'backflow-clearance',
    requirement: 'Backflow preventer accessibility',
    specification: 'Minimum 12 inches above grade, accessible on all sides',
    reference: 'Georgia EPD, ASSE 1013',
  },
  {
    code: 'sleeve-under-hardscape',
    requirement: 'Pipe sleeves under paving',
    specification: 'PVC sleeve 2x pipe diameter, installed before paving',
    reference: 'IA BMPs',
  },
  {
    code: 'pressure-test',
    requirement: 'System pressure testing',
    specification: 'Test at 1.5x working pressure for 2 hours minimum',
    reference: 'IA BMPs, ASTM standards',
  },
];

// ============================================================================
// WATER CONSERVATION INCENTIVES
// ============================================================================

export interface ConservationIncentive {
  program: string;
  provider: string;
  description: string;
  eligibility: string;
  benefit: string;
  contactInfo: string;
}

export const CONSERVATION_INCENTIVES: ConservationIncentive[] = [
  {
    program: 'Smart Controller Rebate',
    provider: 'Various metro water utilities',
    description: 'Rebate for installing EPA WaterSense labeled smart controllers',
    eligibility: 'Residential and commercial customers',
    benefit: '$50-200 rebate',
    contactInfo: 'Check with local water provider',
  },
  {
    program: 'Rain Sensor Rebate',
    provider: 'Some counties',
    description: 'Rebate for rain sensor installation on existing systems',
    eligibility: 'Existing irrigation systems',
    benefit: '$25-50 rebate',
    contactInfo: 'Check with local water provider',
  },
  {
    program: 'Irrigation Audit Program',
    provider: 'Gwinnett County, others',
    description: 'Free irrigation system audit and recommendations',
    eligibility: 'Residential customers in participating counties',
    benefit: 'Free audit plus recommendations',
    contactInfo: 'Gwinnett Water: 678-376-6900',
  },
];

// ============================================================================
// CONSTRUCTION NOTES FOR PLANS
// ============================================================================

export const GEORGIA_CONSTRUCTION_NOTES: string[] = [
  'All work shall comply with Georgia Water Stewardship Act requirements.',
  'Rain sensor or soil moisture sensor required per O.C.G.A. § 12-5-7.',
  'Backflow prevention device required per Georgia EPD Rules 391-3-5-.13.',
  'Annual backflow test required within 10 days of installation and annually thereafter.',
  'Contractor shall verify all underground utility locations. Call 811 minimum 48 hours prior to excavation.',
  'All pipe to be installed minimum 6 inches below finished grade.',
  'Install PVC sleeves under all paved surfaces. Sleeves to be 2x diameter of enclosed pipe.',
  'Controller shall be connected to dedicated GFCI-protected circuit.',
  'System shall be pressure tested at 1.5x working pressure for minimum 2 hours prior to backfill.',
  'Final coverage check and head adjustment required with owner present.',
  'Program controller per county watering schedule. Provide schedule to owner.',
  'Irrigation contractor must hold valid Georgia Certified Irrigation Contractor (GCIC) license.',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get county-specific water restrictions
 */
export function getCountyRestrictions(county: string): CountyRestriction | undefined {
  return METRO_ATLANTA_RESTRICTIONS.find(
    c => c.county.toLowerCase() === county.toLowerCase()
  );
}

/**
 * Get required backflow device for jurisdiction
 */
export function getRequiredBackflow(jurisdiction: string, isCommercial: boolean): BackflowRequirement {
  // Commercial always requires RPZ in Georgia
  if (isCommercial) {
    return BACKFLOW_REQUIREMENTS.find(b => b.deviceType === 'RPZ')!;
  }
  // Residential may use DCVA or PVB depending on local requirements
  return BACKFLOW_REQUIREMENTS.find(b => b.deviceType === 'RPZ')!; // Default to RPZ for safety
}

/**
 * Check if rain sensor is required
 */
export function isRainSensorRequired(): boolean {
  return true; // Required by Georgia Water Stewardship Act for all automatic systems
}

/**
 * Get watering schedule for county
 */
export function getWateringSchedule(county: string, isOddAddress: boolean): {
  days: string[];
  hours: string;
} {
  const restrictions = getCountyRestrictions(county);
  if (!restrictions) {
    // Default schedule
    return {
      days: isOddAddress ? ['Tuesday', 'Thursday', 'Saturday'] : ['Monday', 'Wednesday', 'Friday'],
      hours: '4:00 AM - 10:00 AM',
    };
  }

  return {
    days: isOddAddress ? ['Tuesday', 'Thursday', 'Saturday'] : ['Monday', 'Wednesday', 'Friday'],
    hours: restrictions.wateringHours,
  };
}

/**
 * Get all construction notes for plan sheets
 */
export function getConstructionNotes(): string[] {
  return GEORGIA_CONSTRUCTION_NOTES;
}

/**
 * Get regulatory context for AI prompts
 */
export function getRegulatoryContext(): string {
  return `GEORGIA REGULATORY REQUIREMENTS:

1. RAIN SENSOR (REQUIRED)
   - All automatic irrigation systems must have rain sensor or soil moisture sensor
   - Per Georgia Water Stewardship Act (O.C.G.A. § 12-5-7)

2. BACKFLOW PREVENTION (REQUIRED)
   - RPZ (Reduced Pressure Zone) required for all commercial
   - Must be above grade and accessible
   - Annual testing by certified tester required

3. WATERING RESTRICTIONS
   - Odd/even address watering schedule (3 days per week)
   - No watering 10 AM - 4 PM during drought conditions
   - Drip irrigation exempt from restrictions

4. CONSTRUCTION REQUIREMENTS
   - Minimum 6" burial depth for pipe
   - Pressure test at 1.5x working pressure for 2 hours
   - Sleeves under all hardscape
   - GFCI-protected controller circuit

5. LICENSING
   - Contractor must hold Georgia Certified Irrigation Contractor (GCIC) license`;
}
