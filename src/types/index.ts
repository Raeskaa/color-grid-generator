export interface GridCell {
  id: string;
  color: string;
  originalIndex: number;
}

export interface GridState {
  cells: GridCell[];
  timestamp: number;
}

export type PatternType = 
  | 'gradient'
  | 'solid'
  | 'horizontal-stripes'
  | 'vertical-stripes'
  | 'checkerboard'
  | 'plaid'
  | 'pixel-art';

export interface PatternConfig {
  stripeWidth?: number;
  plaidComplexity?: number;
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal-45' | 'diagonal-135' | 'radial';
}

export type EffectType = 
  | 'blur'
  | 'grain'
  | 'gamma'
  | 'threshold'
  | 'stippling'
  | 'halftone'
  | 'edge-detection'
  | 'vignette'
  | 'rgb-shift'
  | 'crt-screen'
  | 'led-screen'
  | 'dithering';

export interface EffectConfig {
  blur?: {
    radius: number;
  };
  grain?: {
    opacity: number;
  };
  gamma?: {
    value: number;
  };
  threshold?: {
    value: number;
  };
  stippling?: {
    density: number;
    dotSize: number;
  };
  halftone?: {
    dotSize: number;
    angle: number;
    shape: 'circle' | 'square';
  };
  vignette?: {
    strength: number;
  };
  rgbShift?: {
    amount: number;
  };
  crtScreen?: {
    scanlineIntensity: number;
    curvature: number;
  };
  ledScreen?: {
    pixelSize: number;
    gap: number;
  };
}

export interface ImageEffect {
  id: string;
  type: EffectType;
  enabled: boolean;
  config: EffectConfig;
}

export interface BrandColor {
  id: string;
  name: string;
  color: string;
  isPrimary?: boolean;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: BrandColor[];
  createdAt: number;
}

export type ColorSchemeType = 
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'monochromatic'
  | 'split-complementary'
  | 'tetradic';

export interface AspectRatio {
  name: string;
  ratio: number;
  width: number;
  height: number;
  category: 'web' | 'social' | 'print' | 'presentation';
}

export interface GridPreset {
  id: string;
  name: string;
  rows: number;
  cols: number;
  patternType: PatternType;
  patternConfig: PatternConfig;
  brandColors: BrandColor[];
  effects: ImageEffect[];
  aspectRatio?: AspectRatio;
  createdAt: number;
}

export interface ControlPanelProps {
  rows: number;
  cols: number;
  color1: string;
  color2: string;
  minIntensity: number;
  maxIntensity: number;
  patternType: PatternType;
  patternConfig: PatternConfig;
  enableGrain: boolean;
  grainOpacity: number;
  downloadQuality: number;
  canUndo: boolean;
  canRedo: boolean;
  effects: ImageEffect[];
  brandColors: BrandColor[];
  selectedAspectRatio: AspectRatio | null;
  showSafeZones: boolean;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
  onColor1Change: (color: string) => void;
  onColor2Change: (color: string) => void;
  onMinIntensityChange: (intensity: number) => void;
  onMaxIntensityChange: (intensity: number) => void;
  onPatternTypeChange: (pattern: PatternType) => void;
  onPatternConfigChange: (config: PatternConfig) => void;
  onEnableGrainChange: (enabled: boolean) => void;
  onGrainOpacityChange: (opacity: number) => void;
  onDownloadQualityChange: (quality: number) => void;
  onEffectsChange: (effects: ImageEffect[]) => void;
  onBrandColorsChange: (colors: BrandColor[]) => void;
  onAspectRatioChange: (ratio: AspectRatio | null) => void;
  onShowSafeZonesChange: (show: boolean) => void;
  onRandomize: () => void;
  onRandomizeWithBrandColors: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: GridPreset) => void;
}