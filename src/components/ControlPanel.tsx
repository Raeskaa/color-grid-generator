import React from 'react';
import { Download, Shuffle, RotateCcw, Undo, Redo, Palette, Grid, Layers, Zap, Target } from 'lucide-react';
import { ControlPanelProps, PatternType } from '../types';
import { EffectsPanel } from './EffectsPanel';
import { BrandColorManager } from './BrandColorManager';
import { AspectRatioSelector } from './AspectRatioSelector';
import { PresetManager } from './PresetManager';

const PATTERN_OPTIONS: { value: PatternType; label: string; description: string }[] = [
  { value: 'gradient', label: 'Gradient', description: 'Smooth color transition' },
  { value: 'solid', label: 'Solid Blocks', description: 'Solid color regions' },
  { value: 'horizontal-stripes', label: 'Horizontal Stripes', description: 'Alternating horizontal bands' },
  { value: 'vertical-stripes', label: 'Vertical Stripes', description: 'Alternating vertical bands' },
  { value: 'checkerboard', label: 'Checkerboard', description: 'Classic checkerboard pattern' },
  { value: 'plaid', label: 'Plaid/Weave', description: 'Complex woven pattern' },
  { value: 'pixel-art', label: 'Pixel Art', description: 'Simple geometric shapes' }
];

const GRADIENT_DIRECTIONS = [
  { value: 'horizontal', label: 'Horizontal →' },
  { value: 'vertical', label: 'Vertical ↓' },
  { value: 'diagonal-45', label: 'Diagonal ↘' },
  { value: 'diagonal-135', label: 'Diagonal ↙' },
  { value: 'radial', label: 'Radial ○' }
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  rows,
  cols,
  color1,
  color2,
  minIntensity,
  maxIntensity,
  patternType,
  patternConfig,
  enableGrain,
  grainOpacity,
  downloadQuality,
  canUndo,
  canRedo,
  effects,
  brandColors,
  selectedAspectRatio,
  showSafeZones,
  onRowsChange,
  onColsChange,
  onColor1Change,
  onColor2Change,
  onMinIntensityChange,
  onMaxIntensityChange,
  onPatternTypeChange,
  onPatternConfigChange,
  onEnableGrainChange,
  onGrainOpacityChange,
  onDownloadQualityChange,
  onEffectsChange,
  onBrandColorsChange,
  onAspectRatioChange,
  onShowSafeZonesChange,
  onRandomize,
  onRandomizeWithBrandColors,
  onReset,
  onUndo,
  onRedo,
  onDownload,
  onSavePreset,
  onLoadPreset
}) => {
  const handleStripeWidthChange = (width: number) => {
    onPatternConfigChange({ ...patternConfig, stripeWidth: width });
  };

  const handlePlaidComplexityChange = (complexity: number) => {
    onPatternConfigChange({ ...patternConfig, plaidComplexity: complexity });
  };

  const handleGradientDirectionChange = (direction: string) => {
    onPatternConfigChange({ 
      ...patternConfig, 
      gradientDirection: direction as 'horizontal' | 'vertical' | 'diagonal-45' | 'diagonal-135' | 'radial'
    });
  };

  const showStripeControls = patternType === 'horizontal-stripes' || patternType === 'vertical-stripes';
  const showPlaidControls = patternType === 'plaid';
  const showGradientControls = patternType === 'gradient';
  const hasBrandColors = brandColors.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-h-screen overflow-y-auto">
      {/* Brand Color Management */}
      <div className="border-b pb-6">
        <BrandColorManager
          brandColors={brandColors}
          onBrandColorsChange={onBrandColorsChange}
        />
      </div>

      {/* Aspect Ratio & Layout */}
      <div className="space-y-4 border-b pb-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Target className="w-5 h-5 text-green-600" />
          Layout & Format
        </div>
        
        <AspectRatioSelector
          selectedAspectRatio={selectedAspectRatio}
          onAspectRatioChange={onAspectRatioChange}
        />

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showSafeZones}
              onChange={(e) => onShowSafeZonesChange(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Safe Zones</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">
            Display guides for text and logo placement
          </p>
        </div>
      </div>

      {/* Grid Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Grid className="w-5 h-5 text-blue-600" />
          Grid Configuration
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rows
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => onRowsChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Columns
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={cols}
              onChange={(e) => onColsChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Pattern Type Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Layers className="w-5 h-5 text-indigo-600" />
          Pattern Type
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Pattern
          </label>
          <select
            value={patternType}
            onChange={(e) => onPatternTypeChange(e.target.value as PatternType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {PATTERN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {PATTERN_OPTIONS.find(opt => opt.value === patternType)?.description}
          </p>
        </div>

        {/* Gradient Direction Controls */}
        {showGradientControls && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gradient Direction
            </label>
            <select
              value={patternConfig.gradientDirection || 'horizontal'}
              onChange={(e) => handleGradientDirectionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {GRADIENT_DIRECTIONS.map((direction) => (
                <option key={direction.value} value={direction.value}>
                  {direction.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pattern-specific controls */}
        {showStripeControls && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stripe Width ({patternConfig.stripeWidth || 1})
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={patternConfig.stripeWidth || 1}
              onChange={(e) => handleStripeWidthChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}

        {showPlaidControls && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plaid Complexity ({patternConfig.plaidComplexity || 3})
            </label>
            <input
              type="range"
              min="2"
              max="6"
              value={patternConfig.plaidComplexity || 3}
              onChange={(e) => handlePlaidComplexityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}
      </div>

      {/* Color Configuration - Only show if no brand colors or as fallback */}
      {!hasBrandColors && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Palette className="w-5 h-5 text-purple-600" />
            Color Configuration
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color 1
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => onColor1Change(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => onColor1Change(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color 2
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => onColor2Change(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => onColor2Change(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Intensity ({minIntensity}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={minIntensity}
                onChange={(e) => onMinIntensityChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Intensity ({maxIntensity}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={maxIntensity}
                onChange={(e) => onMaxIntensityChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          Actions
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRandomize}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Shuffle className="w-4 h-4" />
            Randomize
          </button>
          
          {hasBrandColors && (
            <button
              onClick={onRandomizeWithBrandColors}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              <Palette className="w-4 h-4" />
              Brand Random
            </button>
          )}
          
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Undo className="w-4 h-4" />
            Undo
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Redo className="w-4 h-4" />
            Redo
          </button>
        </div>
      </div>

      {/* Visual Effects */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Zap className="w-5 h-5 text-yellow-600" />
          Basic Effects
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableGrain}
              onChange={(e) => onEnableGrainChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Enable Grain Effect</span>
          </label>
          
          {enableGrain && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grain Opacity ({grainOpacity}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={grainOpacity}
                onChange={(e) => onGrainOpacityChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}
        </div>
      </div>

      {/* Advanced Effects Panel */}
      <div className="border-t pt-6">
        <EffectsPanel
          effects={effects}
          onEffectsChange={onEffectsChange}
        />
      </div>

      {/* Preset Management */}
      <div className="border-t pt-6">
        <PresetManager
          currentPreset={{
            rows,
            cols,
            patternType,
            patternConfig,
            brandColors,
            effects,
            aspectRatio: selectedAspectRatio
          }}
          onSavePreset={onSavePreset}
          onLoadPreset={onLoadPreset}
        />
      </div>

      {/* Download */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Download className="w-5 h-5 text-green-600" />
          Export
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Download Quality (Scale: {downloadQuality}x)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={downloadQuality}
              onChange={(e) => onDownloadQualityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Download PNG with Effects
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            Downloads will include all applied effects and maintain aspect ratio
          </p>
        </div>
      </div>
    </div>
  );
};