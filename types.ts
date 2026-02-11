export enum WorkflowStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
  GENERATING_SITE_PLAN = 'GENERATING_SITE_PLAN',
  SITE_PLAN_COMPLETE = 'SITE_PLAN_COMPLETE',
  DESIGNING = 'DESIGNING',
  DESIGN_COMPLETE = 'DESIGN_COMPLETE',
  EXPORTING = 'EXPORTING',
  ERROR = 'ERROR',
}

// Point on image (normalized 0-1 coordinates)
export interface ImagePoint {
  x: number; // 0-1 (percentage of image width)
  y: number; // 0-1 (percentage of image height)
}

// Scale reference from two marked points
export interface ScaleReference {
  point1: ImagePoint;
  point2: ImagePoint;
  distanceFt: number;
}

// User markup on the image
export interface ImageMarkup {
  scaleReference?: ScaleReference;
  controllerLocation?: ImagePoint;
  waterSourceLocation?: ImagePoint;
  irrigationAreas?: ImagePoint[][]; // Array of polygons (each polygon is array of points)
}

export interface ProjectInput {
  projectName: string;
  waterSupplySize: 0.75 | 1 | 1.5 | 2;
  staticPressurePSI: number;
  soilType: 'clay' | 'loam' | 'sand';
  turfType: 'bermudagrass' | 'fescue' | 'zoysia' | 'centipede' | 'st-augustine';
  applicationType: 'commercial' | 'multifamily' | 'athletic-field' | 'hoa-common-area';
  droneImageBase64: string;
  droneImageMimeType: string;
  droneImagePreviewUrl: string;
  // User markup on the image
  imageMarkup?: ImageMarkup;
}

export interface IrrigableZone {
  id: string;
  type: 'turf' | 'bed' | 'planter' | 'narrow-strip' | 'tree-ring';
  shape: 'rectangular' | 'irregular' | 'circular' | 'L-shaped' | 'triangular';
  widthFt: number;
  lengthFt: number;
  areaFt2: number;
  exposure: 'full-sun' | 'partial-shade' | 'full-shade';
  slopeRatio: string | null;
  centerX: number;
  centerY: number;
  boundaryPoints: Array<{ x: number; y: number }>;
}

export interface SiteAnalysis {
  totalIrrigableSqFt: number;
  propertyWidthFt: number;
  propertyLengthFt: number;
  turfZones: IrrigableZone[];
  bedZones: IrrigableZone[];
  narrowStrips: IrrigableZone[];
  hardscapeBoundaries: Array<{
    type: 'walkway' | 'driveway' | 'parking' | 'building' | 'patio' | 'other';
    boundaryPoints: Array<{ x: number; y: number }>;
  }>;
  structures: Array<{
    type: string;
    position: { x: number; y: number };
    widthFt: number;
    lengthFt: number;
  }>;
  slopeIndicators: Array<{
    location: { x: number; y: number };
    direction: string;
    ratio: string;
  }>;
  treeCanopyAreas: Array<{
    position: { x: number; y: number };
    radiusFt: number;
  }>;
  waterSourceLocation: { x: number; y: number } | null;
  controllerLocation: { x: number; y: number } | null;
  nearestBuildingLocation: { x: number; y: number };
}

export interface HeadPlacement {
  id: string;
  x: number;
  y: number;
  type: 'rotor' | 'spray' | 'rotary-nozzle' | 'drip' | 'strip' | 'quick-coupler';
  model: string;
  manufacturer: string;
  arc: number;
  radiusFt: number;
  gpm: number;
  psi: number;
  nozzle: string;
  zoneId: string;
}

export interface PipeSegment {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  diameterIn: number;
  material: 'sch40-pvc' | 'class200-pvc';
  type: 'mainline' | 'lateral' | 'drip-supply';
  zoneId: string | null;
}

export interface Zone {
  id: string;
  number: number;
  headType: 'rotor' | 'spray' | 'rotary-nozzle' | 'drip' | 'strip';
  exposure: string;
  heads: string[];
  totalGPM: number;
  precipRateInPerHr: number;
  runtimeMinutes: number;
  color: string;
  valveModel: string;
  valveSize: number;
}

export interface MaterialScheduleItem {
  item: string;
  manufacturer: string;
  model: string;
  quantity: number;
  unit: string;
}

export interface IrrigationDesign {
  heads: HeadPlacement[];
  pipes: PipeSegment[];
  zones: Zone[];
  valves: Array<{
    id: string;
    x: number;
    y: number;
    model: string;
    size: number;
    type: 'zone' | 'master';
    zoneId: string | null;
  }>;
  controller: {
    x: number;
    y: number;
    model: string;
  };
  backflow: {
    x: number;
    y: number;
    model: string;
    size: number;
  };
  poc: {
    x: number;
    y: number;
  };
  rainSensor: {
    x: number;
    y: number;
    model: string;
  };
  materialSchedule: MaterialScheduleItem[];
  zoneSchedule: Zone[];
  totalSystemGPM: number;
  totalZones: number;
}

export interface PlanSheet {
  sheetNumber: string;
  title: string;
  svgContent: string;
  pageType: 'plan' | 'details' | 'schedule';
}

export interface AppState {
  projectInput: ProjectInput | null;
  siteAnalysis: SiteAnalysis | null;
  sitePlanSvg: string | null;
  irrigationSvg: string | null;
  design: IrrigationDesign | null;
  planSheets: PlanSheet[];
  status: WorkflowStatus;
  error: string | null;
  progress: string;
}

export interface DesignRecommendations {
  headTypesPerZone: Array<{
    zoneDescription: string;
    recommendedHead: string;
    reasoning: string;
  }>;
  suggestedZoneCount: number;
  valveClusterLocations: Array<{ x: number; y: number; description: string }>;
  controllerLocation: { x: number; y: number; reasoning: string };
  mainlineRouteSuggestions: string[];
}
