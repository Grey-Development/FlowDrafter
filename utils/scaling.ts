import { getScaleForAcreage } from '../data/designRules';

export const ARCH_D_WIDTH_IN = 36;
export const ARCH_D_HEIGHT_IN = 24;
export const ARCH_D_WIDTH_PT = ARCH_D_WIDTH_IN * 72;
export const ARCH_D_HEIGHT_PT = ARCH_D_HEIGHT_IN * 72;
export const MARGIN_IN = 0.5;
export const TITLE_BLOCK_WIDTH_IN = 4;

export const DRAWING_AREA_WIDTH_IN = ARCH_D_WIDTH_IN - (2 * MARGIN_IN) - TITLE_BLOCK_WIDTH_IN;
export const DRAWING_AREA_HEIGHT_IN = ARCH_D_HEIGHT_IN - (2 * MARGIN_IN);

export interface ScaleConfig {
  scale: number;
  label: string;
  feetPerInch: number;
  pixelsPerFoot: number;
  svgWidth: number;
  svgHeight: number;
}

export function calculateScale(propertyWidthFt: number, propertyLengthFt: number): ScaleConfig {
  const acres = (propertyWidthFt * propertyLengthFt) / 43560;
  const { scale, label } = getScaleForAcreage(acres);
  const feetPerInch = scale;
  const drawingWidthFt = DRAWING_AREA_WIDTH_IN * feetPerInch;
  const pixelsPerFoot = DRAWING_AREA_WIDTH_IN * 96 / drawingWidthFt;
  const svgWidth = ARCH_D_WIDTH_IN * 96;
  const svgHeight = ARCH_D_HEIGHT_IN * 96;
  return { scale, label, feetPerInch, pixelsPerFoot, svgWidth, svgHeight };
}

export function feetToSvgUnits(feet: number, pixelsPerFoot: number): number {
  return feet * pixelsPerFoot;
}

export function svgUnitsToFeet(pixels: number, pixelsPerFoot: number): number {
  return pixels / pixelsPerFoot;
}

export function getDrawingOrigin(): { x: number; y: number } {
  return { x: MARGIN_IN * 96, y: MARGIN_IN * 96 };
}

export function getTitleBlockOrigin(svgWidth: number): { x: number; y: number } {
  return {
    x: svgWidth - (TITLE_BLOCK_WIDTH_IN + MARGIN_IN) * 96,
    y: MARGIN_IN * 96,
  };
}

export function generateScaleBar(feetPerInch: number): { lengths: number[]; labels: string[] } {
  const unit = feetPerInch;
  return {
    lengths: [0, unit, unit * 2, unit * 3, unit * 4],
    labels: ['0', unit + "'", (unit * 2) + "'", (unit * 3) + "'", (unit * 4) + "'"],
  };
}
