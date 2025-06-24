import React, { useState } from 'react';
import { Plus, X, Palette, Lightbulb, Save, Upload } from 'lucide-react';
import { BrandColor, ColorSchemeType } from '../types';
import { generateColorScheme } from '../utils/colorUtils';

interface BrandColorManagerProps {
  brandColors: BrandColor[];
  onBrandColorsChange: (colors: BrandColor[]) => void;
}

const COLOR_SCHEME_OPTIONS: { value: ColorSchemeType; label: string; description: string }[] = [
  { value: 'complementary', label: 'Complementary', description: 'Opposite colors on color wheel' },
  { value: 'analogous', label: 'Analogous', description: 'Adjacent colors on color wheel' },
  { value: 'triadic', label: 'Triadic', description: 'Three evenly spaced colors' },
  { value: 'split-complementary', label: 'Split Complementary', description: 'Base + two adjacent to complement' },
  { value: 'tetradic', label: 'Tetradic', description: 'Four colors forming rectangle' },
  { value: 'monochromatic', label: 'Monochromatic', description: 'Variations of single hue' }
];

export const BrandColorManager: React.FC<BrandColorManagerProps> = ({
  brandColors,
  onBrandColorsChange
}) => {
  const [newColorName, setNewColorName] = useState('');
  const [newColorValue, setNewColorValue] = useState('#3B82F6');
  const [selectedSchemeType, setSelectedSchemeType] = useState<ColorSchemeType>('complementary');

  const addBrandColor = () => {
    if (newColorName.trim() && newColorValue) {
      const newColor: BrandColor = {
        id: `brand-color-${Date.now()}`,
        name: newColorName.trim(),
        color: newColorValue,
        isPrimary: brandColors.length === 0
      };
      
      onBrandColorsChange([...brandColors, newColor]);
      setNewColorName('');
      setNewColorValue('#3B82F6');
    }
  };

  const removeBrandColor = (id: string) => {
    onBrandColorsChange(brandColors.filter(color => color.id !== id));
  };

  const updateBrandColor = (id: string, updates: Partial<BrandColor>) => {
    onBrandColorsChange(
      brandColors.map(color =>
        color.id === id ? { ...color, ...updates } : color
      )
    );
  };

  const generateScheme = () => {
    if (brandColors.length === 0) return;
    
    const baseColor = brandColors.find(c => c.isPrimary)?.color || brandColors[0].color;
    const generatedColors = generateColorScheme(baseColor, selectedSchemeType);
    
    const newColors: BrandColor[] = generatedColors.slice(1).map((color, index) => ({
      id: `generated-${Date.now()}-${index}`,
      name: `Generated ${index + 1}`,
      color,
      isPrimary: false
    }));
    
    onBrandColorsChange([...brandColors, ...newColors]);
  };

  const setPrimaryColor = (id: string) => {
    onBrandColorsChange(
      brandColors.map(color => ({
        ...color,
        isPrimary: color.id === id
      }))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <Palette className="w-5 h-5 text-purple-600" />
        Brand Color Palette
      </div>

      {/* Add New Color */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-700">Add Brand Color</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Color name (e.g., Primary Blue)"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <input
            type="color"
            value={newColorValue}
            onChange={(e) => setNewColorValue(e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
          />
          <button
            onClick={addBrandColor}
            disabled={!newColorName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color Scheme Generator */}
      {brandColors.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            <h4 className="font-medium text-gray-700">Generate Color Scheme</h4>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedSchemeType}
              onChange={(e) => setSelectedSchemeType(e.target.value as ColorSchemeType)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {COLOR_SCHEME_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={generateScheme}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-gray-600">
            {COLOR_SCHEME_OPTIONS.find(opt => opt.value === selectedSchemeType)?.description}
          </p>
        </div>
      )}

      {/* Brand Colors List */}
      {brandColors.length > 0 ? (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Your Brand Colors</h4>
          {brandColors.map((color) => (
            <div
              key={color.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                color.isPrimary 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg border-2 border-white shadow-sm cursor-pointer"
                style={{ backgroundColor: color.color }}
                onClick={() => setPrimaryColor(color.id)}
                title={color.isPrimary ? 'Primary color' : 'Click to set as primary'}
              />
              
              <div className="flex-1">
                <input
                  type="text"
                  value={color.name}
                  onChange={(e) => updateBrandColor(color.id, { name: e.target.value })}
                  className="font-medium text-gray-800 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-gray-300 focus:rounded px-2 py-1 -mx-2 -my-1"
                />
                <p className="text-xs text-gray-500 font-mono">{color.color}</p>
              </div>
              
              {color.isPrimary && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  Primary
                </span>
              )}
              
              <input
                type="color"
                value={color.color}
                onChange={(e) => updateBrandColor(color.id, { color: e.target.value })}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              
              <button
                onClick={() => removeBrandColor(color.id)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No brand colors added yet</p>
          <p className="text-sm">Add colors to maintain brand consistency</p>
        </div>
      )}

      {brandColors.length > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <p className="font-medium mb-1">💡 Pro Tips:</p>
          <ul className="space-y-1">
            <li>• Click a color swatch to set it as primary for scheme generation</li>
            <li>• Use 2-5 brand colors for best results</li>
            <li>• Generated schemes work great for gradient patterns</li>
          </ul>
        </div>
      )}
    </div>
  );
};