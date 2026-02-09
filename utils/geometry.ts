export interface Point {
  x: number;
  y: number;
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function areaOfPolygon(points: Point[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

export function centroid(points: Point[]): Point {
  const n = points.length;
  let cx = 0, cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  return { x: cx / n, y: cy / n };
}

export function boundingBox(points: Point[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function generateGridPoints(
  originX: number,
  originY: number,
  width: number,
  height: number,
  spacingX: number,
  spacingY: number,
  pattern: 'square' | 'triangular' = 'square'
): Point[] {
  const points: Point[] = [];
  const cols = Math.ceil(width / spacingX) + 1;
  const rows = Math.ceil(height / spacingY) + 1;
  for (let row = 0; row < rows; row++) {
    const offsetX = (pattern === 'triangular' && row % 2 === 1) ? spacingX / 2 : 0;
    for (let col = 0; col < cols; col++) {
      const x = originX + col * spacingX + offsetX;
      const y = originY + row * spacingY;
      if (x <= originX + width && y <= originY + height) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

export function offsetPoint(origin: Point, angle: number, dist: number): Point {
  return {
    x: origin.x + dist * Math.cos(angle),
    y: origin.y + dist * Math.sin(angle),
  };
}

export function angleBetween(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function pathLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distance(points[i - 1], points[i]);
  }
  return total;
}
