export const ZONE_COLORS: string[] = [
  '#DC2626',
  '#2563EB',
  '#16A34A',
  '#EA580C',
  '#9333EA',
  '#92400E',
  '#DB2777',
  '#0D9488',
];

export const ZONE_COLOR_NAMES: string[] = [
  'Red', 'Blue', 'Green', 'Orange', 'Purple', 'Brown', 'Magenta', 'Teal',
];

export const MAINLINE_COLOR = '#1E3A5F';
export const DRIP_SUPPLY_COLOR = '#92400E';
export const COVERAGE_CIRCLE_OPACITY = 0.15;

export function getZoneColor(zoneIndex: number): string {
  return ZONE_COLORS[zoneIndex % ZONE_COLORS.length];
}

export function getZoneColorName(zoneIndex: number): string {
  return ZONE_COLOR_NAMES[zoneIndex % ZONE_COLOR_NAMES.length];
}
