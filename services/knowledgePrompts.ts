/**
 * FlowDrafter Knowledge Prompts
 *
 * Structured prompts that inject irrigation design expertise into Gemini AI
 * These prompts transform the AI into an expert irrigation designer
 */

import { DESIGN_METHODOLOGY, HEAD_SELECTION_MATRIX, ZONE_SEPARATION_RULES, WATER_CONSERVATION, QUALITY_STANDARDS, getConservationContext } from '../data/irrigationKnowledge';
import { VELOCITY_LIMITS, PIPE_CAPACITIES } from '../data/hydraulics';
import { ALL_NOZZLES } from '../data/nozzlePerformance';
import { TURF_SPECIES, SOIL_TYPES, ATLANTA_ET_DATA, getSchedulingContext } from '../data/plantWaterNeeds';
import { getRegulatoryContext, GEORGIA_CONSTRUCTION_NOTES } from '../data/regionalRequirements';

// ============================================================================
// SYSTEM INSTRUCTION - EXPERT PERSONA
// ============================================================================

export const EXPERT_SYSTEM_INSTRUCTION = `You are a senior Certified Irrigation Designer (CID) with 25 years of experience in commercial and residential irrigation system design in the Southeast United States, specializing in Georgia and the Atlanta metropolitan area.

YOUR CREDENTIALS:
- Irrigation Association Certified Irrigation Designer (CID)
- EPA WaterSense Partner
- Georgia Certified Irrigation Contractor (GCIC)
- LEED AP with specialty in water efficiency

YOUR EXPERTISE INCLUDES:
1. Site analysis from aerial photography and survey data
2. Hydraulic calculations and pipe sizing
3. Head selection and spacing for optimal uniformity
4. Zone design and hydrozoning principles
5. Water conservation and efficiency optimization
6. Georgia Water Stewardship Act compliance
7. Backflow prevention requirements
8. Smart controller programming and scheduling

YOUR DESIGN PHILOSOPHY:
- Water conservation is paramount - design for efficiency first
- Head-to-head coverage ensures uniform distribution
- Match precipitation rates within zones to prevent over/under watering
- Separate zones by plant water needs, exposure, and soil type
- Size pipes for max 5 fps velocity to prevent water hammer
- Specify pressure regulation to prevent misting
- Always include rain sensors (required by Georgia law)

YOUR REGIONAL KNOWLEDGE:
- Atlanta metro area: Zone 7b/8a, heavy clay soil common
- Peak irrigation demand: June-August
- Odd/even watering schedules enforced
- Bermudagrass and zoysia are primary warm-season turfs
- Fescue is the only viable cool-season option (North Georgia)
- Red clay soil requires low precipitation rates and cycle-soak

When analyzing sites or making design decisions, apply this expertise to provide professional-grade recommendations that a practicing irrigation designer would approve.`;

// ============================================================================
// SITE ANALYSIS CONTEXT
// ============================================================================

export function getSiteAnalysisPrompt(projectContext: {
  applicationType: string;
  turfType: string;
  soilType?: string;
}): string {
  const turf = TURF_SPECIES.find(t => t.id === projectContext.turfType);

  return `You are analyzing a drone aerial photograph as a senior irrigation designer.

PROJECT CONTEXT:
- Application type: ${projectContext.applicationType}
- Turf type: ${turf?.commonName || projectContext.turfType}
- ${turf ? `Turf characteristics: ${turf.droughtTolerance} drought tolerance, ${turf.shadeTolerance} shade tolerance` : ''}
- Region: Southeast US (Georgia/Atlanta metro)
- Typical soil: Heavy clay (Piedmont region)

WHAT TO IDENTIFY:
1. IRRIGABLE ZONES
   - Turf areas (open grass) - estimate dimensions in feet
   - Landscape beds (shrubs, groundcover, mulched areas)
   - Narrow strips under 8 feet wide (require strip nozzles)
   - Tree rings and planters (require drip irrigation)

2. HARDSCAPE BOUNDARIES
   - Buildings (note building faces for controller placement)
   - Driveways, parking areas, walkways
   - Patios and decks
   - Curbs and edges

3. SITE CONDITIONS
   - Sun/shade patterns (note tree canopy areas)
   - Slope indicators (drainage direction, visible grades)
   - Potential water source locations (utility meters, building connections)
   - Suggested controller location (near building, accessible)

4. DESIGN CONSIDERATIONS
   - Areas requiring separate zones (different exposures, slopes)
   - Problem areas (narrow strips, irregular shapes, slopes)
   - Access points for maintenance

COORDINATE SYSTEM:
- Use feet as units
- Origin (0,0) at top-left corner
- X increases to the right
- Y increases downward
- Estimate dimensions using visible scale references (buildings, parking spaces typically 9x18 ft)

Provide realistic professional estimates. It's better to be conservative with coverage areas.`;
}

// ============================================================================
// HEAD SELECTION KNOWLEDGE
// ============================================================================

export function getHeadSelectionContext(): string {
  const headMatrix = HEAD_SELECTION_MATRIX.map(h =>
    `${h.zoneType} (${h.minDimension}-${h.maxDimension} ft): ${h.preferredHead} - ${h.reasoning}`
  ).join('\n');

  const nozzleSummary = ALL_NOZZLES.slice(0, 10).map(n =>
    `${n.model}: ${n.category}, ${n.performanceTable[0]?.radiusFt}-${n.performanceTable[n.performanceTable.length-1]?.radiusFt} ft radius`
  ).join('\n');

  return `HEAD SELECTION PRINCIPLES:

${headMatrix}

AVAILABLE EQUIPMENT:
${nozzleSummary}

KEY RULES:
1. Head-to-head spacing: Space heads at manufacturer-rated radius (not diameter)
2. Corner heads use 90° arcs, edge heads use 180°, interior use 360°
3. Never mix rotors (0.4-0.6 in/hr precip) with sprays (1.5+ in/hr) in same zone
4. Use rotary nozzles (MP Rotator) for clay soil - low precip rate
5. Use strip nozzles for areas under 8 ft wide
6. Use drip for all beds, tree rings, and planters
7. Athletic fields require large rotors + quick couplers`;
}

// ============================================================================
// ZONE DESIGN KNOWLEDGE
// ============================================================================

export function getZoneDesignContext(): string {
  const separationRules = ZONE_SEPARATION_RULES.map(r =>
    `${r.rule.toUpperCase()} (${r.requirement}): ${r.reasoning}`
  ).join('\n\n');

  return `ZONE SEPARATION PRINCIPLES:

${separationRules}

HYDRAULIC LIMITS:
- Max 15 GPM on 1" lateral (spray zones)
- Max 22 GPM on 1.25" lateral (rotor zones)
- Max velocity: ${VELOCITY_LIMITS.maxVelocityFPS} fps in all pipes
- Maintain 10% pressure variation max between heads

ZONE GROUPING ORDER:
1. Group by head type (never mix)
2. Group by exposure (full-sun, partial-shade, full-shade)
3. Group by soil type if varies across site
4. Group by slope (separate >4:1 slopes)
5. Keep zone GPM within lateral limits

PRECIPITATION RATE MATCHING:
- Use matched-precipitation nozzle sets (Hunter MP Rotator, Rain Bird R-VAN)
- Quarter arc = quarter flow, half arc = half flow
- Calculate: PR (in/hr) = (96.25 × GPM) / area`;
}

// ============================================================================
// HYDRAULIC DESIGN KNOWLEDGE
// ============================================================================

export function getHydraulicContext(): string {
  const pipeCapacityTable = PIPE_CAPACITIES.map(p =>
    `${p.sizeIn}" ${p.material}: Max ${p.maxGPMAt5FPS} GPM at 5 fps - ${p.typicalApplication}`
  ).join('\n');

  return `HYDRAULIC DESIGN PRINCIPLES:

PIPE SIZING TABLE:
${pipeCapacityTable}

PRESSURE REQUIREMENTS:
- Spray heads: Minimum 30 PSI at head
- Rotors: Minimum 45 PSI at head
- Drip: 20-30 PSI (use pressure regulator)

FRICTION LOSS CONSIDERATIONS:
- Account for friction loss in all pipe runs
- Add equivalent lengths for fittings (90° elbow = 2-5 ft, tee = 4-8 ft)
- Backflow preventer (RPZ) loses 8-10 PSI
- Zone valves lose 2-4 PSI

VELOCITY CONSTRAINTS:
- Maximum: ${VELOCITY_LIMITS.maxVelocityFPS} fps (prevents water hammer)
- Warning: ${VELOCITY_LIMITS.warningVelocityFPS} fps (elevated noise)
- Minimum: ${VELOCITY_LIMITS.minVelocityFPS} fps (prevents sediment)

MAINLINE SIZING:
- Under 40 GPM: 1.5" Sch 40 PVC
- 40-80 GPM: 2" Sch 40 PVC
- Over 80 GPM: Consider 2.5" or larger

LATERAL SIZING:
- Spray zones: 3/4" or 1" Class 200 PVC
- Rotor zones: 1" or 1.25" Class 200 PVC`;
}

// ============================================================================
// WATER CONSERVATION KNOWLEDGE
// ============================================================================

export function getConservationKnowledge(): string {
  const conservationPrinciples = WATER_CONSERVATION.map(c =>
    `${c.principle.toUpperCase()}: ${c.description}\nWater savings: ${c.waterSavings}\nImplementation: ${c.implementation.join('; ')}`
  ).join('\n\n');

  return `WATER CONSERVATION BEST PRACTICES:

${conservationPrinciples}

EFFICIENCY TARGETS:
- Distribution Uniformity (DU): Target 70%, Excellent 85%
- Scheduling Coefficient: Target 1.2, Excellent 1.1
- System Efficiency: Target 75%+

SMART SCHEDULING:
- Water 4-6 AM (lowest evaporation)
- Use ET-based controller adjustments
- Implement cycle-and-soak for clay soil
- Seasonal adjustments: Winter 0%, Spring 50%, Summer 100%, Fall 40%`;
}

// ============================================================================
// SCHEDULING AND PLANT NEEDS
// ============================================================================

export function getSchedulingKnowledge(turfType: string, soilType: string): string {
  return `SCHEDULING KNOWLEDGE:

${getSchedulingContext(turfType, soilType)}

ATLANTA AREA SEASONAL IRRIGATION:
${ATLANTA_ET_DATA.filter(m => m.irrigationNeededIn > 0).map(m =>
  `${m.month}: ${m.irrigationNeededIn}" weekly, ET ${m.avgETInPerDay} in/day`
).join('\n')}

CLAY SOIL SCHEDULING:
- Maximum runtime: 5-10 minutes per cycle
- Soak time between cycles: 30 minutes
- Multiple short cycles better than one long cycle
- Rotary nozzles preferred (0.4 in/hr vs 1.5+ in/hr spray)`;
}

// ============================================================================
// REGULATORY COMPLIANCE
// ============================================================================

export function getRegulatoryKnowledge(): string {
  return getRegulatoryContext();
}

// ============================================================================
// CONSTRUCTION NOTES
// ============================================================================

export function getConstructionNotes(): string {
  return `CONSTRUCTION NOTES FOR PLAN SHEETS:

${GEORGIA_CONSTRUCTION_NOTES.map((note, i) => `${i + 1}. ${note}`).join('\n')}`;
}

// ============================================================================
// DESIGN VALIDATION PROMPT
// ============================================================================

export function getDesignValidationPrompt(designSummary: {
  totalZones: number;
  totalGPM: number;
  headTypes: string[];
  mainlineSize: number;
  hasRainSensor: boolean;
  hasBackflow: boolean;
}): string {
  return `Validate this irrigation design against professional standards:

DESIGN SUMMARY:
- Total zones: ${designSummary.totalZones}
- Peak demand: ${designSummary.totalGPM} GPM
- Head types: ${designSummary.headTypes.join(', ')}
- Mainline: ${designSummary.mainlineSize}" PVC
- Rain sensor: ${designSummary.hasRainSensor ? 'Yes' : 'MISSING - REQUIRED'}
- Backflow: ${designSummary.hasBackflow ? 'Yes' : 'MISSING - REQUIRED'}

CHECK AGAINST:
1. Georgia Water Stewardship Act compliance
2. Hydraulic adequacy (velocity < 5 fps)
3. Zone separation principles
4. Coverage uniformity
5. Equipment selection appropriateness

Identify any issues and provide specific recommendations for improvement.`;
}

// ============================================================================
// COMPLETE KNOWLEDGE CONTEXT
// ============================================================================

export function getCompleteKnowledgeContext(projectContext: {
  applicationType: string;
  turfType: string;
  soilType: string;
}): string {
  return `
=== IRRIGATION DESIGN KNOWLEDGE BASE ===

${getHeadSelectionContext()}

---

${getZoneDesignContext()}

---

${getHydraulicContext()}

---

${getConservationKnowledge()}

---

${getSchedulingKnowledge(projectContext.turfType, projectContext.soilType)}

---

${getRegulatoryKnowledge()}
`;
}

// ============================================================================
// DESIGN RECOMMENDATION PROMPT
// ============================================================================

export function getDesignRecommendationPrompt(siteAnalysis: object, projectContext: {
  applicationType: string;
  turfType: string;
  soilType: string;
  waterSupplySize: number;
  staticPressurePSI: number;
}): string {
  return `Based on your expertise as a senior irrigation designer, provide design recommendations for this site.

SITE ANALYSIS:
${JSON.stringify(siteAnalysis, null, 2)}

PROJECT PARAMETERS:
- Application: ${projectContext.applicationType}
- Turf: ${projectContext.turfType}
- Soil: ${projectContext.soilType}
- Water supply: ${projectContext.waterSupplySize}"
- Static pressure: ${projectContext.staticPressurePSI} PSI

${getCompleteKnowledgeContext(projectContext)}

PROVIDE RECOMMENDATIONS FOR:
1. Head type selection for each identified zone (with reasoning)
2. Zone grouping strategy (how many zones, what separation logic)
3. Pipe sizing recommendations
4. Valve manifold locations
5. Controller and backflow placement
6. Any water conservation opportunities
7. Potential design challenges and solutions

Be specific and practical. Reference actual equipment models where appropriate.`;
}
