import React, { useState, useEffect, useCallback } from 'react';
import { ColorGrid } from './components/ColorGrid';
import { ControlPanel } from './components/ControlPanel';
import { generatePatternGrid, generateBrandColorGrid } from './utils/colorUtils';
import { downloadGridAsPNG, generateFilename } from './utils/downloadUtils';
import { useGridHistory } from './hooks/useGridHistory';
import { GridCell, PatternType, PatternConfig, ImageEffect, BrandColor, AspectRatio, GridPreset } from './types';

const CELL_SIZE_PX = 50;
const GRID_ID = 'main-color-grid';

function App() {
  // Grid configuration
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [color1, setColor1] = useState('#3B82F6');
  const [color2, setColor2] = useState('#8B5CF6');
  const [minIntensity, setMinIntensity] = useState(20);
  const [maxIntensity, setMaxIntensity] = useState(80);

  // Pattern configuration
  const [patternType, setPatternType] = useState<PatternType>('gradient');
  const [patternConfig, setPatternConfig] = useState<PatternConfig>({
    stripeWidth: 1,
    plaidComplexity: 3,
    gradientDirection: 'horizontal'
  });

  // Brand colors
  const [brandColors, setBrandColors] = useState<BrandColor[]>([]);

  // Layout and formatting
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio | null>(null);
  const [showSafeZones, setShowSafeZones] = useState(false);

  // Visual effects
  const [enableGrain, setEnableGrain] = useState(false);
  const [grainOpacity, setGrainOpacity] = useState(30);
  const [effects, setEffects] = useState<ImageEffect[]>([]);

  // Download settings
  const [downloadQuality, setDownloadQuality] = useState(2);

  // Track if grid is randomized for filename generation
  const [isRandomized, setIsRandomized] = useState(false);

  // Generate initial grid
  const generateInitialGrid = useCallback(() => {
    if (brandColors.length > 0) {
      return generateBrandColorGrid(
        rows, cols, brandColors, minIntensity, maxIntensity, patternType, patternConfig
      );
    }
    return generatePatternGrid(
      rows, cols, color1, color2, minIntensity, maxIntensity, patternType, patternConfig
    );
  }, [rows, cols, color1, color2, minIntensity, maxIntensity, patternType, patternConfig, brandColors]);

  const initialCells = generateInitialGrid();

  // History management
  const {
    currentCells,
    canUndo,
    canRedo,
    addToHistory,
    resetHistory,
    undo,
    redo
  } = useGridHistory(initialCells);

  // Update grid dimensions based on aspect ratio
  useEffect(() => {
    if (selectedAspectRatio) {
      const targetCells = 16; // Target around 16 cells for good balance
      const ratio = selectedAspectRatio.ratio;
      
      let newCols, newRows;
      if (ratio > 1) {
        // Landscape
        newCols = Math.round(Math.sqrt(targetCells * ratio));
        newRows = Math.round(targetCells / newCols);
      } else {
        // Portrait or square
        newRows = Math.round(Math.sqrt(targetCells / ratio));
        newCols = Math.round(targetCells / newRows);
      }
      
      // Ensure minimum dimensions
      newCols = Math.max(2, Math.min(20, newCols));
      newRows = Math.max(2, Math.min(20, newRows));
      
      if (newCols !== cols || newRows !== rows) {
        setRows(newRows);
        setCols(newCols);
      }
    }
  }, [selectedAspectRatio, cols, rows]);

  // Regenerate grid when parameters change
  useEffect(() => {
    const newCells = generateInitialGrid();
    resetHistory(newCells);
    setIsRandomized(false);
  }, [generateInitialGrid, resetHistory]);

  // Randomize grid positions
  const handleRandomize = useCallback(() => {
    const shuffledCells = [...currentCells].sort(() => Math.random() - 0.5);
    // Reassign IDs to maintain proper React keys
    const newCells = shuffledCells.map((cell, index) => ({
      ...cell,
      id: `cell-randomized-${index}-${Date.now()}`
    }));
    
    addToHistory(newCells);
    setIsRandomized(true);
  }, [currentCells, addToHistory]);

  // Randomize with brand colors only
  const handleRandomizeWithBrandColors = useCallback(() => {
    if (brandColors.length === 0) {
      handleRandomize();
      return;
    }

    // Generate new grid with brand colors and randomize
    const newCells = generateBrandColorGrid(
      rows, cols, brandColors, minIntensity, maxIntensity, patternType, patternConfig
    );
    const shuffledCells = [...newCells].sort(() => Math.random() - 0.5);
    const finalCells = shuffledCells.map((cell, index) => ({
      ...cell,
      id: `cell-brand-randomized-${index}-${Date.now()}`
    }));
    
    addToHistory(finalCells);
    setIsRandomized(true);
  }, [brandColors, rows, cols, minIntensity, maxIntensity, patternType, patternConfig, addToHistory, handleRandomize]);

  // Reset to original pattern
  const handleReset = useCallback(() => {
    const newCells = generateInitialGrid();
    resetHistory(newCells);
    setIsRandomized(false);
  }, [generateInitialGrid, resetHistory]);

  // Save preset
  const handleSavePreset = useCallback((name: string) => {
    // This is handled by the PresetManager component
    console.log(`Preset "${name}" saved successfully!`);
  }, []);

  // Load preset
  const handleLoadPreset = useCallback((preset: GridPreset) => {
    setRows(preset.rows);
    setCols(preset.cols);
    setPatternType(preset.patternType);
    setPatternConfig(preset.patternConfig);
    setBrandColors(preset.brandColors);
    setEffects(preset.effects);
    setSelectedAspectRatio(preset.aspectRatio || null);
    
    // Reset randomization state
    setIsRandomized(false);
  }, []);

  // Download as PNG with effects
  const handleDownload = useCallback(() => {
    const filename = generateFilename(
      rows, cols, 
      brandColors.length > 0 ? brandColors[0].color : color1, 
      brandColors.length > 1 ? brandColors[1].color : color2, 
      isRandomized, patternType, effects
    );
    
    // Use a small delay to ensure the grid is fully rendered
    setTimeout(() => {
      downloadGridAsPNG(GRID_ID, filename, downloadQuality, effects);
    }, 100);
  }, [rows, cols, color1, color2, brandColors, isRandomized, downloadQuality, patternType, effects]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Professional Brand Background Generator
          </h1>
          <p className="text-lg text-gray-600">
            Create stunning brand-consistent backgrounds with advanced color management and professional effects
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Control Panel */}
          <div className="lg:w-96 flex-shrink-0">
            <ControlPanel
              rows={rows}
              cols={cols}
              color1={color1}
              color2={color2}
              minIntensity={minIntensity}
              maxIntensity={maxIntensity}
              patternType={patternType}
              patternConfig={patternConfig}
              enableGrain={enableGrain}
              grainOpacity={grainOpacity}
              downloadQuality={downloadQuality}
              canUndo={canUndo}
              canRedo={canRedo}
              effects={effects}
              brandColors={brandColors}
              selectedAspectRatio={selectedAspectRatio}
              showSafeZones={showSafeZones}
              onRowsChange={setRows}
              onColsChange={setCols}
              onColor1Change={setColor1}
              onColor2Change={setColor2}
              onMinIntensityChange={setMinIntensity}
              onMaxIntensityChange={setMaxIntensity}
              onPatternTypeChange={setPatternType}
              onPatternConfigChange={setPatternConfig}
              onEnableGrainChange={setEnableGrain}
              onGrainOpacityChange={setGrainOpacity}
              onDownloadQualityChange={setDownloadQuality}
              onEffectsChange={setEffects}
              onBrandColorsChange={setBrandColors}
              onAspectRatioChange={setSelectedAspectRatio}
              onShowSafeZonesChange={setShowSafeZones}
              onRandomize={handleRandomize}
              onRandomizeWithBrandColors={handleRandomizeWithBrandColors}
              onReset={handleReset}
              onUndo={undo}
              onRedo={redo}
              onDownload={handleDownload}
              onSavePreset={handleSavePreset}
              onLoadPreset={handleLoadPreset}
            />
          </div>

          {/* Grid Display */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <ColorGrid
                gridId={GRID_ID}
                cells={currentCells}
                rows={rows}
                cols={cols}
                cellSize={CELL_SIZE_PX}
                enableGrain={enableGrain}
                grainOpacity={grainOpacity}
                effects={effects}
                aspectRatio={selectedAspectRatio}
                showSafeZones={showSafeZones}
              />
              
              {/* Grid Info */}
              <div className="mt-4 text-center text-sm text-gray-600">
                <p className="font-mono text-xs mt-1">
                  {brandColors.length > 0 
                    ? `${brandColors.length} brand colors | ${patternType.replace('-', ' ')}`
                    : `${color1} → ${color2} | ${patternType.replace('-', ' ')}`
                  }
                </p>
                {effects.filter(e => e.enabled).length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {effects.filter(e => e.enabled).length} effect(s) applied
                  </p>
                )}
                {brandColors.length > 0 && (
                  <div className="flex justify-center gap-1 mt-2">
                    {brandColors.slice(0, 5).map((color, index) => (
                      <div
                        key={color.id}
                        className="w-4 h-4 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      />
                    ))}
                    {brandColors.length > 5 && (
                      <span className="text-xs text-gray-500 ml-1">+{brandColors.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Professional brand background generator with advanced color management, aspect ratio presets, 
            and comprehensive visual effects. Perfect for creating consistent brand assets across all platforms.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;