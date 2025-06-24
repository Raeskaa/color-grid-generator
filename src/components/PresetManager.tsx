import React, { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Star, Clock } from 'lucide-react';
import { GridPreset, BrandColor, ImageEffect, PatternType, PatternConfig, AspectRatio } from '../types';

interface PresetManagerProps {
  currentPreset: {
    rows: number;
    cols: number;
    patternType: PatternType;
    patternConfig: PatternConfig;
    brandColors: BrandColor[];
    effects: ImageEffect[];
    aspectRatio: AspectRatio | null;
  };
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: GridPreset) => void;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  currentPreset,
  onSavePreset,
  onLoadPreset
}) => {
  const [presets, setPresets] = useState<GridPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load presets from localStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('colorGridPresets');
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Error loading presets:', error);
      }
    }
  }, []);

  // Save presets to localStorage whenever presets change
  useEffect(() => {
    localStorage.setItem('colorGridPresets', JSON.stringify(presets));
  }, [presets]);

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;

    const preset: GridPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      rows: currentPreset.rows,
      cols: currentPreset.cols,
      patternType: currentPreset.patternType,
      patternConfig: currentPreset.patternConfig,
      brandColors: currentPreset.brandColors,
      effects: currentPreset.effects,
      aspectRatio: currentPreset.aspectRatio,
      createdAt: Date.now()
    };

    setPresets([preset, ...presets]);
    onSavePreset(newPresetName.trim());
    setNewPresetName('');
    setShowSaveDialog(false);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(preset => preset.id !== id));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPresetSummary = (preset: GridPreset) => {
    const parts = [];
    parts.push(`${preset.rows}×${preset.cols}`);
    parts.push(preset.patternType.replace('-', ' '));
    if (preset.brandColors.length > 0) {
      parts.push(`${preset.brandColors.length} colors`);
    }
    if (preset.effects.filter(e => e.enabled).length > 0) {
      parts.push(`${preset.effects.filter(e => e.enabled).length} effects`);
    }
    return parts.join(' • ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700">Saved Presets</h4>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <Save className="w-4 h-4" />
          Save Current
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="bg-green-50 rounded-lg p-4 space-y-3 border border-green-200">
          <h5 className="font-medium text-green-800">Save Current Configuration</h5>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Preset name (e.g., Brand Header Blue)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
              className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              autoFocus
            />
            <button
              onClick={handleSavePreset}
              disabled={!newPresetName.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false);
                setNewPresetName('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Presets List */}
      {presets.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h6 className="font-medium text-gray-800 truncate">{preset.name}</h6>
                  {preset.brandColors.length > 0 && (
                    <div className="flex gap-1">
                      {preset.brandColors.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: color.color }}
                        />
                      ))}
                      {preset.brandColors.length > 3 && (
                        <span className="text-xs text-gray-500">+{preset.brandColors.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{getPresetSummary(preset)}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(preset.createdAt)}
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onLoadPreset(preset)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Load preset"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePreset(preset.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete preset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No saved presets yet</p>
          <p className="text-sm">Save your favorite configurations for quick access</p>
        </div>
      )}

      {presets.length > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <p className="font-medium mb-1">💡 Preset Tips:</p>
          <ul className="space-y-1">
            <li>• Presets save all settings including colors, effects, and aspect ratios</li>
            <li>• Use descriptive names like "Brand Header Blue" or "Social Media Gradient"</li>
            <li>• Presets are saved locally in your browser</li>
          </ul>
        </div>
      )}
    </div>
  );
};