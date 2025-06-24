import { EffectType, EffectConfig, ImageEffect } from '../types';

export const createDefaultEffect = (type: EffectType): ImageEffect => {
  const defaultConfigs: Record<EffectType, EffectConfig> = {
    blur: { blur: { radius: 2 } },
    grain: { grain: { opacity: 30 } },
    gamma: { gamma: { value: 1.2 } },
    threshold: { threshold: { value: 128 } },
    stippling: { stippling: { density: 50, dotSize: 2 } },
    halftone: { halftone: { dotSize: 4, angle: 45, shape: 'circle' } },
    'edge-detection': {},
    vignette: { vignette: { strength: 50 } },
    'rgb-shift': { rgbShift: { amount: 3 } },
    'crt-screen': { crtScreen: { scanlineIntensity: 30, curvature: 10 } },
    'led-screen': { ledScreen: { pixelSize: 3, gap: 1 } },
    dithering: {}
  };

  return {
    id: `${type}-${Date.now()}`,
    type,
    enabled: true,
    config: defaultConfigs[type]
  };
};

export const applyEffectsToCanvas = (
  canvas: HTMLCanvasElement,
  effects: ImageEffect[]
): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let processedData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  // Apply effects in order
  for (const effect of effects) {
    if (!effect.enabled) continue;

    switch (effect.type) {
      case 'gamma':
        processedData = applyGamma(processedData, effect.config.gamma?.value || 1);
        break;
      case 'threshold':
        processedData = applyThreshold(processedData, effect.config.threshold?.value || 128);
        break;
      case 'edge-detection':
        processedData = applyEdgeDetection(processedData);
        break;
      case 'rgb-shift':
        processedData = applyRGBShift(processedData, effect.config.rgbShift?.amount || 3);
        break;
      case 'dithering':
        processedData = applyDithering(processedData);
        break;
    }
  }

  // Create new canvas with processed data
  const processedCanvas = document.createElement('canvas');
  processedCanvas.width = canvas.width;
  processedCanvas.height = canvas.height;
  const processedCtx = processedCanvas.getContext('2d');
  if (processedCtx) {
    processedCtx.putImageData(processedData, 0, 0);
    
    // Apply CSS-based effects
    applyCanvasEffects(processedCanvas, effects);
  }

  return processedCanvas;
};

const applyCanvasEffects = (canvas: HTMLCanvasElement, effects: ImageEffect[]) => {
  const filters: string[] = [];

  for (const effect of effects) {
    if (!effect.enabled) continue;

    switch (effect.type) {
      case 'blur':
        filters.push(`blur(${effect.config.blur?.radius || 2}px)`);
        break;
      case 'vignette':
        // Vignette will be applied as an overlay
        break;
    }
  }

  if (filters.length > 0) {
    canvas.style.filter = filters.join(' ');
  }
};

const applyGamma = (imageData: ImageData, gamma: number): ImageData => {
  const data = imageData.data;
  const gammaCorrection = 1 / gamma;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.pow(data[i] / 255, gammaCorrection) * 255;     // Red
    data[i + 1] = Math.pow(data[i + 1] / 255, gammaCorrection) * 255; // Green
    data[i + 2] = Math.pow(data[i + 2] / 255, gammaCorrection) * 255; // Blue
  }

  return new ImageData(data, imageData.width, imageData.height);
};

const applyThreshold = (imageData: ImageData, threshold: number): ImageData => {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const value = gray > threshold ? 255 : 0;
    data[i] = value;     // Red
    data[i + 1] = value; // Green
    data[i + 2] = value; // Blue
  }

  return new ImageData(data, imageData.width, imageData.height);
};

const applyEdgeDetection = (imageData: ImageData): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const newData = new Uint8ClampedArray(data.length);

  // Sobel operator
  const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let pixelX = 0;
      let pixelY = 0;

      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const idx = ((y + i) * width + (x + j)) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          pixelX += gray * sobelX[i + 1][j + 1];
          pixelY += gray * sobelY[i + 1][j + 1];
        }
      }

      const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
      const idx = (y * width + x) * 4;
      newData[idx] = magnitude;     // Red
      newData[idx + 1] = magnitude; // Green
      newData[idx + 2] = magnitude; // Blue
      newData[idx + 3] = 255;       // Alpha
    }
  }

  return new ImageData(newData, width, height);
};

const applyRGBShift = (imageData: ImageData, amount: number): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const newData = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Red channel - shift right
      const redX = Math.min(width - 1, x + amount);
      const redIdx = (y * width + redX) * 4;
      newData[idx] = data[redIdx];

      // Green channel - no shift
      newData[idx + 1] = data[idx + 1];

      // Blue channel - shift left
      const blueX = Math.max(0, x - amount);
      const blueIdx = (y * width + blueX) * 4;
      newData[idx + 2] = data[blueIdx + 2];

      newData[idx + 3] = data[idx + 3]; // Alpha
    }
  }

  return new ImageData(newData, width, height);
};

const applyDithering = (imageData: ImageData): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Floyd-Steinberg dithering
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      for (let c = 0; c < 3; c++) { // RGB channels
        const oldPixel = data[idx + c];
        const newPixel = oldPixel > 128 ? 255 : 0;
        data[idx + c] = newPixel;
        
        const error = oldPixel - newPixel;
        
        // Distribute error to neighboring pixels
        if (x + 1 < width) {
          const rightIdx = (y * width + (x + 1)) * 4;
          data[rightIdx + c] = Math.min(255, Math.max(0, data[rightIdx + c] + error * 7 / 16));
        }
        
        if (y + 1 < height) {
          if (x > 0) {
            const bottomLeftIdx = ((y + 1) * width + (x - 1)) * 4;
            data[bottomLeftIdx + c] = Math.min(255, Math.max(0, data[bottomLeftIdx + c] + error * 3 / 16));
          }
          
          const bottomIdx = ((y + 1) * width + x) * 4;
          data[bottomIdx + c] = Math.min(255, Math.max(0, data[bottomIdx + c] + error * 5 / 16));
          
          if (x + 1 < width) {
            const bottomRightIdx = ((y + 1) * width + (x + 1)) * 4;
            data[bottomRightIdx + c] = Math.min(255, Math.max(0, data[bottomRightIdx + c] + error * 1 / 16));
          }
        }
      }
    }
  }

  return new ImageData(data, width, height);
};

export const generateEffectPreview = (effect: ImageEffect): string => {
  const descriptions: Record<EffectType, string> = {
    blur: 'Applies gaussian blur to soften the image',
    grain: 'Adds film grain texture for vintage look',
    gamma: 'Adjusts brightness and contrast curves',
    threshold: 'Converts to black and white with threshold',
    stippling: 'Creates stippled dot pattern effect',
    halftone: 'Simulates halftone printing dots',
    'edge-detection': 'Highlights edges and contours',
    vignette: 'Darkens edges for focus effect',
    'rgb-shift': 'Separates RGB channels for glitch effect',
    'crt-screen': 'Simulates old CRT monitor appearance',
    'led-screen': 'Creates LED display pixel effect',
    dithering: 'Reduces colors with error diffusion'
  };

  return descriptions[effect.type] || 'Image processing effect';
};