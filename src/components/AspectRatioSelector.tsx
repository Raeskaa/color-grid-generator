import React from 'react';
import { Monitor, Smartphone, FileImage, Presentation } from 'lucide-react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selectedAspectRatio: AspectRatio | null;
  onAspectRatioChange: (ratio: AspectRatio | null) => void;
}

const ASPECT_RATIOS: AspectRatio[] = [
  // Web
  { name: 'Web Banner', ratio: 16/9, width: 1920, height: 1080, category: 'web' },
  { name: 'Web Header', ratio: 3/1, width: 1200, height: 400, category: 'web' },
  { name: 'Blog Header', ratio: 2/1, width: 1200, height: 600, category: 'web' },
  
  // Social Media
  { name: 'Instagram Post', ratio: 1/1, width: 1080, height: 1080, category: 'social' },
  { name: 'Instagram Story', ratio: 9/16, width: 1080, height: 1920, category: 'social' },
  { name: 'Facebook Cover', ratio: 851/315, width: 851, height: 315, category: 'social' },
  { name: 'Twitter Header', ratio: 3/1, width: 1500, height: 500, category: 'social' },
  { name: 'LinkedIn Banner', ratio: 4/1, width: 1584, height: 396, category: 'social' },
  
  // Presentation
  { name: 'Presentation 16:9', ratio: 16/9, width: 1920, height: 1080, category: 'presentation' },
  { name: 'Presentation 4:3', ratio: 4/3, width: 1024, height: 768, category: 'presentation' },
  
  // Print
  { name: 'A4 Portrait', ratio: 210/297, width: 2480, height: 3508, category: 'print' },
  { name: 'A4 Landscape', ratio: 297/210, width: 3508, height: 2480, category: 'print' },
  { name: 'Letter Portrait', ratio: 8.5/11, width: 2550, height: 3300, category: 'print' },
  { name: 'Letter Landscape', ratio: 11/8.5, width: 3300, height: 2550, category: 'print' }
];

const CATEGORY_ICONS = {
  web: Monitor,
  social: Smartphone,
  presentation: Presentation,
  print: FileImage
};

const CATEGORY_LABELS = {
  web: 'Web',
  social: 'Social Media',
  presentation: 'Presentation',
  print: 'Print'
};

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  selectedAspectRatio,
  onAspectRatioChange
}) => {
  const groupedRatios = ASPECT_RATIOS.reduce((acc, ratio) => {
    if (!acc[ratio.category]) acc[ratio.category] = [];
    acc[ratio.category].push(ratio);
    return acc;
  }, {} as Record<string, AspectRatio[]>);

  const handleCategoryChange = (category: string) => {
    if (category === '') {
      onAspectRatioChange(null);
    } else {
      // Auto-select first ratio in category
      const firstRatio = groupedRatios[category]?.[0];
      if (firstRatio) {
        onAspectRatioChange(firstRatio);
      }
    }
  };

  const handleRatioChange = (ratioName: string) => {
    if (ratioName === '') {
      onAspectRatioChange(null);
    } else {
      const ratio = ASPECT_RATIOS.find(r => r.name === ratioName);
      if (ratio) {
        onAspectRatioChange(ratio);
      }
    }
  };

  const selectedCategory = selectedAspectRatio?.category || '';
  const availableRatios = selectedCategory ? groupedRatios[selectedCategory] || [] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700">Aspect Ratio Presets</h4>
        {selectedAspectRatio && (
          <button
            onClick={() => onAspectRatioChange(null)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">Select category...</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Format Dropdown */}
      {selectedCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <select
            value={selectedAspectRatio?.name || ''}
            onChange={(e) => handleRatioChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select format...</option>
            {availableRatios.map((ratio) => (
              <option key={ratio.name} value={ratio.name}>
                {ratio.name} ({ratio.ratio.toFixed(2)}:1)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Ratio Info */}
      {selectedAspectRatio && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            {React.createElement(CATEGORY_ICONS[selectedAspectRatio.category], {
              className: 'w-4 h-4 text-blue-600'
            })}
            <span className="font-medium text-gray-800">{selectedAspectRatio.name}</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>Ratio: {selectedAspectRatio.ratio.toFixed(2)}:1</p>
            <p>Recommended: {selectedAspectRatio.width} × {selectedAspectRatio.height}px</p>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <p className="font-medium mb-1">💡 How it works:</p>
        <p>Select a category first, then choose the specific format. Your grid dimensions will automatically adjust to match the chosen aspect ratio.</p>
      </div>
    </div>
  );
};