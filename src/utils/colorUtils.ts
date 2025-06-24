import { PatternType, PatternConfig, BrandColor, ColorSchemeType } from '../types';

export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0];
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
    .toString(16)
    .slice(1)}`;
};

export const hexToHsl = (hex: string): [number, number, number] => {
  const [r, g, b] = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / diff + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / diff + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
};

export const hslToHex = (h: number, s: number, l: number): string => {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
};

export const generateColorScheme = (baseColor: string, schemeType: ColorSchemeType): string[] => {
  const [h, s, l] = hexToHsl(baseColor);
  const colors: string[] = [baseColor];

  switch (schemeType) {
    case 'complementary':
      colors.push(hslToHex((h + 180) % 360, s, l));
      break;

    case 'analogous':
      colors.push(hslToHex((h + 30) % 360, s, l));
      colors.push(hslToHex((h - 30 + 360) % 360, s, l));
      break;

    case 'triadic':
      colors.push(hslToHex((h + 120) % 360, s, l));
      colors.push(hslToHex((h + 240) % 360, s, l));
      break;

    case 'split-complementary':
      colors.push(hslToHex((h + 150) % 360, s, l));
      colors.push(hslToHex((h + 210) % 360, s, l));
      break;

    case 'tetradic':
      colors.push(hslToHex((h + 90) % 360, s, l));
      colors.push(hslToHex((h + 180) % 360, s, l));
      colors.push(hslToHex((h + 270) % 360, s, l));
      break;

    case 'monochromatic':
      colors.push(hslToHex(h, s, Math.max(10, l - 20)));
      colors.push(hslToHex(h, s, Math.min(90, l + 20)));
      colors.push(hslToHex(h, Math.max(10, s - 20), l));
      break;
  }

  return colors;
};

export const interpolateColor = (
  color1: string,
  color2: string,
  factor: number
): string => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  
  const r = r1 + (r2 - r1) * factor;
  const g = g1 + (g2 - g1) * factor;
  const b = b1 + (b2 - b1) * factor;
  
  return rgbToHex(r, g, b);
};

export const blendWithWhite = (color: string, intensity: number): string => {
  const [r, g, b] = hexToRgb(color);
  const factor = intensity / 100;
  
  const blendedR = 255 + (r - 255) * factor;
  const blendedG = 255 + (g - 255) * factor;
  const blendedB = 255 + (b - 255) * factor;
  
  return rgbToHex(blendedR, blendedG, blendedB);
};

export const generateGradientGrid = (
  rows: number,
  cols: number,
  color1: string,
  color2: string,
  minIntensity: number,
  maxIntensity: number,
  direction: 'horizontal' | 'vertical' | 'diagonal-45' | 'diagonal-135' | 'radial' = 'horizontal'
) => {
  const cells = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let horizontalFactor = 0;
      let verticalFactor = 0;

      switch (direction) {
        case 'horizontal':
          horizontalFactor = cols > 1 ? col / (cols - 1) : 0;
          verticalFactor = rows > 1 ? row / (rows - 1) : 0;
          break;
        case 'vertical':
          horizontalFactor = rows > 1 ? row / (rows - 1) : 0;
          verticalFactor = cols > 1 ? col / (cols - 1) : 0;
          break;
        case 'diagonal-45':
          horizontalFactor = (row + col) / (rows + cols - 2);
          verticalFactor = Math.abs(row - col) / Math.max(rows - 1, cols - 1);
          break;
        case 'diagonal-135':
          horizontalFactor = (row + (cols - 1 - col)) / (rows + cols - 2);
          verticalFactor = Math.abs(row - (cols - 1 - col)) / Math.max(rows - 1, cols - 1);
          break;
        case 'radial':
          const centerRow = (rows - 1) / 2;
          const centerCol = (cols - 1) / 2;
          const maxDistance = Math.sqrt(centerRow * centerRow + centerCol * centerCol);
          const distance = Math.sqrt((row - centerRow) ** 2 + (col - centerCol) ** 2);
          horizontalFactor = distance / maxDistance;
          verticalFactor = 1 - horizontalFactor;
          break;
      }
      
      // Interpolate between color1 and color2
      const baseColor = interpolateColor(color1, color2, horizontalFactor);
      
      // Calculate intensity
      const intensity = minIntensity + (maxIntensity - minIntensity) * verticalFactor;
      
      // Blend with white based on intensity
      const finalColor = blendWithWhite(baseColor, intensity);
      
      cells.push({
        id: `cell-${row}-${col}`,
        color: finalColor,
        originalIndex: row * cols + col
      });
    }
  }
  
  return cells;
};

export const generateBrandColorGrid = (
  rows: number,
  cols: number,
  brandColors: BrandColor[],
  minIntensity: number,
  maxIntensity: number,
  patternType: PatternType,
  patternConfig: PatternConfig = {}
) => {
  if (brandColors.length === 0) {
    return generateGradientGrid(rows, cols, '#3B82F6', '#8B5CF6', minIntensity, maxIntensity);
  }

  const colors = brandColors.map(bc => bc.color);
  const cells = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let baseColor: string;
      
      switch (patternType) {
        case 'gradient':
          const horizontalFactor = cols > 1 ? col / (cols - 1) : 0;
          const colorIndex = horizontalFactor * (colors.length - 1);
          const lowerIndex = Math.floor(colorIndex);
          const upperIndex = Math.min(lowerIndex + 1, colors.length - 1);
          const factor = colorIndex - lowerIndex;
          baseColor = interpolateColor(colors[lowerIndex], colors[upperIndex], factor);
          break;
          
        case 'solid':
          const totalCells = rows * cols;
          const cellsPerColor = Math.ceil(totalCells / colors.length);
          const index = row * cols + col;
          const colorIdx = Math.floor(index / cellsPerColor) % colors.length;
          baseColor = colors[colorIdx];
          break;
          
        case 'horizontal-stripes':
          const stripeWidth = patternConfig.stripeWidth || 1;
          const stripeIndex = Math.floor(row / stripeWidth);
          baseColor = colors[stripeIndex % colors.length];
          break;
          
        case 'vertical-stripes':
          const vStripeWidth = patternConfig.stripeWidth || 1;
          const vStripeIndex = Math.floor(col / vStripeWidth);
          baseColor = colors[vStripeIndex % colors.length];
          break;
          
        case 'checkerboard':
          const checkerIndex = (row + col) % colors.length;
          baseColor = colors[checkerIndex];
          break;
          
        default:
          baseColor = colors[0];
      }
      
      // Apply vertical intensity gradient
      const verticalFactor = rows > 1 ? row / (rows - 1) : 0;
      const intensity = minIntensity + (maxIntensity - minIntensity) * verticalFactor;
      const finalColor = blendWithWhite(baseColor, intensity);
      
      cells.push({
        id: `cell-${row}-${col}`,
        color: finalColor,
        originalIndex: row * cols + col
      });
    }
  }
  
  return cells;
};

export const generateSolidGrid = (
  rows: number,
  cols: number,
  color1: string,
  color2: string,
  minIntensity: number,
  maxIntensity: number
) => {
  const cells = [];
  const totalCells = rows * cols;
  const halfCells = Math.floor(totalCells / 2);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const isFirstHalf = index < halfCells;
      const baseColor = isFirstHalf ? color1 : color2;
      
      // Apply intensity variation
      const intensityFactor = Math.random() * 0.3 + 0.7; // 70-100% intensity
      const intensity = (minIntensity + maxIntensity) / 2 * intensityFactor;
      const finalColor = blendWithWhite(baseColor, intensity);
      
      cells.push({
        id: `cell-${row}-${col}`,
        color: finalColor,
        originalIndex: row * cols + col
      });
    }
  }
  
  return cells;
};

export const generateHorizontalStripes = (
  rows: number,
  cols: number,
  color1: string,
  color2: string,
  minIntensity: number,
  maxIntensity: number,
  stripeWidth: number = 1
) => {
  const cells = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const stripeIndex = Math.floor(row / stripeWidth);
      const isColor1 = stripeIndex % 2 === 0;
      const baseColor = isColor1 ? color1 : color2;
      
      // Apply vertical intensity gradient
      const verticalFactor = rows > 1 ? row / (rows - 1) : 0;
      const intensity = minIntensity + (maxIntensity - minIntensity) * verticalFactor;
      const finalColor = blendWithWhite(baseColor, intensity);
      
      cells.push({
        id: `cell-${row}-${col}`,
        color: finalColor,
        originalIndex: row * cols + col
      });
    }
  }
  
  return cells;
};

export const generateVerticalStripes = (
  rows: number,
  cols: number,
  color1: string,
  color2: string,
  minIntensity: number,
  maxIntensity: number,
  stripeWidth: number = 1
) => {
  const cells = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const stripeIndex = Math.floor(col / stripeWidth);
      const isColor1 = stripeIndex % 2 === 0;
      const baseColor = isColor1 ? color1 : color2;
      
      // Apply vertical intensity gradient
      const verticalFactor = rows > 1 ? row / (rows - 1) : 0;
      const intensity = minIntensity + (maxIntensity - minIntensity) * verticalFactor;
      const finalColor = blendWithWhite(baseColor, intensity);
      
      cells.push({
        id: `cell-${row}-${col}`,
        color: finalColor,
        originalIndex: row * cols + col
      });
    }
  }
  
  return cells;
};

export const generateCheckerboard = (
  rows: number,
  cols: number,
  color1: string,
  color2: string,
  minIntensity: number,
  maxIntensity: number
) => {
  const cells = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isColor1 = (row + col) % 2 === 0;
      const baseColor = isColor1 ? color1 : color2;
      
      // Apply vertical intensity gradient
      const verticalFactor = rows > 1 ? row / (rows - 1) : 0;
      const intensity = minIntensity + (maxIntensity - minIntensity) * verticalFactor;
      const finalColor = blendWithWhite(baseColor, intensity);
      
      cells.push({
        id: `cell-${row}-${col}`,
        color: finalColor,
        originalIndex: row * cols + col
      });
    }
  }
  
  return cells;
};

export const generatePlaidPattern = (
  rows: number,
  cols: number,
  color1: string,
  color2: string,
  minIntensity: number,
  maxIntensity: number,
  complexity: number = 3
) => {
  const cells = [];
  
  // Generate accent colors for plaid complexity
  const accentColor1 = interpolateColor(color1, color2, 0.3);
  const accentColor2 = interpolateColor(color1, color2, 0.7);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Create plaid pattern with varying stripe widths
      const horizontalPattern = Math.floor(col / complexity) % 4;
      const verticalPattern = Math.floor(row / complexity) % 4;
      
      let baseColor = color1;
      
      // Determine color based on intersection patterns
      if (horizontalPattern === 0 && verticalPattern === 0) {
        baseColor = color1;
      } else if (horizontalPattern === 1 && verticalPattern === 1) {
        baseColor = color2;
      } else if (horizontalPattern === 2 || verticalPattern === 2) {
        baseColor = accentColor1;
      } else {
        baseColor = accentColor2;
      }
      
      // Apply vertical intensity gradient
      const verticalFactor = rows > 1 ? row / (rows - 1) : 0;
      const intensity = minIntensity + (maxIntensity - minIntensity) * verticalFactor;
      const finalColor = blendWithWhite(baseColor, intensity);
      
      cells.push({
        id: `cell-${row}-${col}`,
        color: finalColor,
        originalIndex: row * cols + col
      });
    }
  }
  
  return cells;
};

export const generatePixelArt = (
  rows: number,
  cols: number,
  color1: string,
  color2: string,
  minIntensity: number,
  maxIntensity: number
) => {
  const cells = [];
  
  // Create simple pixel art patterns based on grid size
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Create a simple diamond/cross pattern
      const distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
      const maxDistance = centerRow + centerCol;
      
      let baseColor;
      if (distanceFromCenter <= maxDistance / 3) {
        baseColor = color1;
      } else if (distanceFromCenter <= (maxDistance * 2) / 3) {
        baseColor = interpolateColor(color1, color2, 0.5);
      } else {
        baseColor = color2;
      }
      
      // Apply vertical intensity gradient
      const verticalFactor = rows > 1 ? row / (rows - 1) : 0;
      const intensity = minIntensity + (maxIntensity - minIntensity) * verticalFactor;
      const finalColor = blendWithWhite(baseColor, intensity);
      
      cells.push({
        id: `cell-${row}-${col}`,
        color: finalColor,
        originalIndex: row * cols + col
      });
    }
  }
  
  return cells;
};

export const generatePatternGrid = (
  rows: number,
  cols: number,
  color1: string,
  color2: string,
  minIntensity: number,
  maxIntensity: number,
  patternType: PatternType,
  patternConfig: PatternConfig = {}
) => {
  switch (patternType) {
    case 'gradient':
      return generateGradientGrid(
        rows, cols, color1, color2, minIntensity, maxIntensity, 
        patternConfig.gradientDirection || 'horizontal'
      );
    case 'solid':
      return generateSolidGrid(rows, cols, color1, color2, minIntensity, maxIntensity);
    case 'horizontal-stripes':
      return generateHorizontalStripes(rows, cols, color1, color2, minIntensity, maxIntensity, patternConfig.stripeWidth);
    case 'vertical-stripes':
      return generateVerticalStripes(rows, cols, color1, color2, minIntensity, maxIntensity, patternConfig.stripeWidth);
    case 'checkerboard':
      return generateCheckerboard(rows, cols, color1, color2, minIntensity, maxIntensity);
    case 'plaid':
      return generatePlaidPattern(rows, cols, color1, color2, minIntensity, maxIntensity, patternConfig.plaidComplexity);
    case 'pixel-art':
      return generatePixelArt(rows, cols, color1, color2, minIntensity, maxIntensity);
    default:
      return generateGradientGrid(rows, cols, color1, color2, minIntensity, maxIntensity);
  }
};