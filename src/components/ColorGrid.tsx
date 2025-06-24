import React, { useRef, useEffect } from 'react';
import { GridCell, ImageEffect, AspectRatio } from '../types';
import { applyEffectsToCanvas } from '../utils/effectsUtils';

interface ColorGridProps {
  gridId: string;
  cells: GridCell[];
  rows: number;
  cols: number;
  cellSize: number;
  enableGrain: boolean;
  grainOpacity: number;
  effects: ImageEffect[];
  aspectRatio?: AspectRatio | null;
  showSafeZones?: boolean;
}

export const ColorGrid: React.FC<ColorGridProps> = ({
  gridId,
  cells,
  rows,
  cols,
  cellSize,
  enableGrain,
  grainOpacity,
  effects,
  aspectRatio,
  showSafeZones = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions based on aspect ratio or grid size
    let width = cols * cellSize;
    let height = rows * cellSize;

    if (aspectRatio) {
      // Maintain aspect ratio while fitting within reasonable bounds
      const maxDimension = Math.max(width, height);
      if (aspectRatio.ratio > 1) {
        // Landscape
        width = maxDimension;
        height = maxDimension / aspectRatio.ratio;
      } else {
        // Portrait or square
        height = maxDimension;
        width = maxDimension * aspectRatio.ratio;
      }
    }

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate cell dimensions for aspect ratio
    const actualCellWidth = width / cols;
    const actualCellHeight = height / rows;

    // Draw grid cells
    cells.forEach((cell, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = col * actualCellWidth;
      const y = row * actualCellHeight;

      ctx.fillStyle = cell.color;
      ctx.fillRect(x, y, actualCellWidth, actualCellHeight);

      // Add subtle border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, actualCellWidth, actualCellHeight);
    });

    // Apply grain effect if enabled
    if (enableGrain) {
      applyGrainEffect(ctx, width, height, grainOpacity);
    }

    // Apply advanced effects
    if (effects.length > 0) {
      const processedCanvas = applyEffectsToCanvas(canvas, effects);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(processedCanvas, 0, 0);
    }

    // Apply CSS effects that can't be done on canvas
    applyCSSEffects(canvas, effects);

  }, [cells, rows, cols, cellSize, enableGrain, grainOpacity, effects, aspectRatio]);

  const applyGrainEffect = (ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * (opacity / 100) * 255;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyCSSEffects = (canvas: HTMLCanvasElement, effects: ImageEffect[]) => {
    const filters: string[] = [];
    let hasVignette = false;

    for (const effect of effects) {
      if (!effect.enabled) continue;

      switch (effect.type) {
        case 'blur':
          filters.push(`blur(${effect.config.blur?.radius || 2}px)`);
          break;
        case 'vignette':
          hasVignette = true;
          break;
      }
    }

    canvas.style.filter = filters.join(' ');

    // Apply vignette as overlay
    if (hasVignette) {
      const vignetteEffect = effects.find(e => e.type === 'vignette' && e.enabled);
      if (vignetteEffect && containerRef.current) {
        const strength = vignetteEffect.config.vignette?.strength || 50;
        containerRef.current.style.position = 'relative';
        
        // Remove existing vignette
        const existingVignette = containerRef.current.querySelector('.vignette-overlay');
        if (existingVignette) {
          existingVignette.remove();
        }

        // Add new vignette
        const vignetteOverlay = document.createElement('div');
        vignetteOverlay.className = 'vignette-overlay';
        vignetteOverlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          background: radial-gradient(circle, transparent 30%, rgba(0,0,0,${strength / 100}) 100%);
          border-radius: inherit;
        `;
        containerRef.current.appendChild(vignetteOverlay);
      }
    } else if (containerRef.current) {
      const existingVignette = containerRef.current.querySelector('.vignette-overlay');
      if (existingVignette) {
        existingVignette.remove();
      }
    }
  };

  // Calculate display dimensions
  const canvas = canvasRef.current;
  let displayWidth = cols * cellSize;
  let displayHeight = rows * cellSize;

  if (aspectRatio && canvas) {
    const maxDimension = Math.max(displayWidth, displayHeight);
    if (aspectRatio.ratio > 1) {
      displayWidth = maxDimension;
      displayHeight = maxDimension / aspectRatio.ratio;
    } else {
      displayHeight = maxDimension;
      displayWidth = maxDimension * aspectRatio.ratio;
    }
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        id={gridId}
        className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white relative"
        style={{
          width: displayWidth,
          height: displayHeight,
        }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        
        {/* Safe Zones Overlay */}
        {showSafeZones && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Center safe zone */}
            <div className="absolute inset-[15%] border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium bg-white bg-opacity-90 px-2 py-1 rounded">
                Main Content Area
              </span>
            </div>
            
            {/* Corner safe zones */}
            <div className="absolute top-4 left-4 w-16 h-8 border border-dashed border-green-400 bg-green-50 bg-opacity-30 rounded flex items-center justify-center">
              <span className="text-green-600 text-xs">Logo</span>
            </div>
            
            <div className="absolute top-4 right-4 w-20 h-8 border border-dashed border-orange-400 bg-orange-50 bg-opacity-30 rounded flex items-center justify-center">
              <span className="text-orange-600 text-xs">Menu</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Grid Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>{rows} × {cols} Grid | {cells.length} Cells</p>
        {aspectRatio && (
          <p className="text-xs text-blue-600 mt-1">
            {aspectRatio.name} ({aspectRatio.ratio.toFixed(2)}:1)
          </p>
        )}
      </div>
    </div>
  );
};