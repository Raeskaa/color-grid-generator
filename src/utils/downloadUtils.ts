import { PatternType, ImageEffect } from '../types';
import { applyEffectsToCanvas } from './effectsUtils';

export const downloadGridAsPNG = async (
  gridId: string,
  filename: string,
  scale: number = 1,
  effects: ImageEffect[] = []
): Promise<void> => {
  const gridElement = document.getElementById(gridId);
  if (!gridElement) {
    console.error('Grid element not found');
    return;
  }

  try {
    // Find the canvas element within the grid
    const canvas = gridElement.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found in grid');
      return;
    }

    // Create a high-resolution canvas for download
    const downloadCanvas = document.createElement('canvas');
    const ctx = downloadCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set high-resolution dimensions
    downloadCanvas.width = canvas.width * scale;
    downloadCanvas.height = canvas.height * scale;
    
    // Scale the context
    ctx.scale(scale, scale);
    
    // Draw the original canvas content
    ctx.drawImage(canvas, 0, 0);

    // Apply effects to the download canvas if any are active
    let finalCanvas = downloadCanvas;
    if (effects.some(effect => effect.enabled)) {
      finalCanvas = applyEffectsToCanvas(downloadCanvas, effects);
    }

    // Convert to blob and download
    finalCanvas.toBlob((blob) => {
      if (!blob) {
        console.error('Could not create blob from canvas');
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
    }, 'image/png');
    
  } catch (error) {
    console.error('Error downloading grid:', error);
  }
};

export const generateFilename = (
  rows: number,
  cols: number,
  color1: string,
  color2: string,
  isRandomized: boolean = false,
  patternType: PatternType = 'gradient',
  effects: ImageEffect[] = []
): string => {
  const cleanColor1 = color1.replace('#', '');
  const cleanColor2 = color2.replace('#', '');
  const patternSuffix = patternType !== 'gradient' ? `-${patternType}` : '';
  const randomSuffix = isRandomized ? `-randomized` : '';
  
  // Add effects suffix if any effects are enabled
  const enabledEffects = effects.filter(effect => effect.enabled);
  const effectsSuffix = enabledEffects.length > 0 
    ? `-${enabledEffects.map(e => e.type).join('-')}` 
    : '';
  
  const timestamp = Date.now();
  
  return `color-grid-${rows}x${cols}-${cleanColor1}-${cleanColor2}${patternSuffix}${randomSuffix}${effectsSuffix}-${timestamp}.png`;
};