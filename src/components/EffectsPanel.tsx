import React from 'react';
import { ImageEffect, EffectType, EffectConfig } from '../types';
import { createDefaultEffect, generateEffectPreview } from '../utils/effectsUtils';
import { Plus, X, Eye, EyeOff, Settings } from 'lucide-react';

interface EffectsPanelProps {
  effects: ImageEffect[];
  onEffectsChange: (effects: ImageEffect[]) => void;
}

const AVAILABLE_EFFECTS: { type: EffectType; name: string; category: string }[] = [
  { type: 'blur', name: 'Blur', category: 'Basic' },
  { type: 'grain', name: 'Film Grain', category: 'Basic' },
  { type: 'gamma', name: 'Gamma Correction', category: 'Color' },
  { type: 'threshold', name: 'Threshold', category: 'Color' },
  { type: 'edge-detection', name: 'Edge Detection', category: 'Artistic' },
  { type: 'rgb-shift', name: 'RGB Shift', category: 'Glitch' },
  { type: 'dithering', name: 'Dithering', category: 'Artistic' },
  { type: 'vignette', name: 'Vignette', category: 'Basic' },
  { type: 'stippling', name: 'Stippling', category: 'Artistic' },
  { type: 'halftone', name: 'Halftone', category: 'Print' },
  { type: 'crt-screen', name: 'CRT Screen', category: 'Retro' },
  { type: 'led-screen', name: 'LED Screen', category: 'Digital' }
];

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  effects,
  onEffectsChange
}) => {
  const addEffect = (type: EffectType) => {
    const newEffect = createDefaultEffect(type);
    onEffectsChange([...effects, newEffect]);
  };

  const removeEffect = (id: string) => {
    onEffectsChange(effects.filter(effect => effect.id !== id));
  };

  const toggleEffect = (id: string) => {
    onEffectsChange(
      effects.map(effect =>
        effect.id === id ? { ...effect, enabled: !effect.enabled } : effect
      )
    );
  };

  const updateEffectConfig = (id: string, config: EffectConfig) => {
    onEffectsChange(
      effects.map(effect =>
        effect.id === id ? { ...effect, config } : effect
      )
    );
  };

  const moveEffect = (id: string, direction: 'up' | 'down') => {
    const index = effects.findIndex(effect => effect.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= effects.length) return;

    const newEffects = [...effects];
    [newEffects[index], newEffects[newIndex]] = [newEffects[newIndex], newEffects[index]];
    onEffectsChange(newEffects);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Image Effects</h3>
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Effect
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div className="p-2 max-h-64 overflow-y-auto">
              {Object.entries(
                AVAILABLE_EFFECTS.reduce((acc, effect) => {
                  if (!acc[effect.category]) acc[effect.category] = [];
                  acc[effect.category].push(effect);
                  return acc;
                }, {} as Record<string, typeof AVAILABLE_EFFECTS>)
              ).map(([category, categoryEffects]) => (
                <div key={category} className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-2">
                    {category}
                  </div>
                  {categoryEffects.map(effect => (
                    <button
                      key={effect.type}
                      onClick={() => addEffect(effect.type)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-sm"
                      disabled={effects.some(e => e.type === effect.type)}
                    >
                      <div className="font-medium">{effect.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {generateEffectPreview(createDefaultEffect(effect.type))}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {effects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No effects applied</p>
          <p className="text-sm">Add effects to enhance your grid</p>
        </div>
      ) : (
        <div className="space-y-3">
          {effects.map((effect, index) => (
            <EffectCard
              key={effect.id}
              effect={effect}
              index={index}
              totalEffects={effects.length}
              onToggle={() => toggleEffect(effect.id)}
              onRemove={() => removeEffect(effect.id)}
              onConfigChange={(config) => updateEffectConfig(effect.id, config)}
              onMove={(direction) => moveEffect(effect.id, direction)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface EffectCardProps {
  effect: ImageEffect;
  index: number;
  totalEffects: number;
  onToggle: () => void;
  onRemove: () => void;
  onConfigChange: (config: EffectConfig) => void;
  onMove: (direction: 'up' | 'down') => void;
}

const EffectCard: React.FC<EffectCardProps> = ({
  effect,
  index,
  totalEffects,
  onToggle,
  onRemove,
  onConfigChange,
  onMove
}) => {
  const effectName = AVAILABLE_EFFECTS.find(e => e.type === effect.type)?.name || effect.type;

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      effect.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`p-1 rounded transition-colors ${
              effect.enabled ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {effect.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <div>
            <h4 className="font-medium text-gray-800">{effectName}</h4>
            <p className="text-xs text-gray-500">{generateEffectPreview(effect)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↑
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === totalEffects - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {effect.enabled && (
        <EffectControls
          effect={effect}
          onConfigChange={onConfigChange}
        />
      )}
    </div>
  );
};

interface EffectControlsProps {
  effect: ImageEffect;
  onConfigChange: (config: EffectConfig) => void;
}

const EffectControls: React.FC<EffectControlsProps> = ({
  effect,
  onConfigChange
}) => {
  const updateConfig = (key: string, value: any) => {
    onConfigChange({
      ...effect.config,
      [effect.type]: {
        ...effect.config[effect.type as keyof EffectConfig],
        [key]: value
      }
    });
  };

  switch (effect.type) {
    case 'blur':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blur Radius ({effect.config.blur?.radius || 2}px)
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={effect.config.blur?.radius || 2}
              onChange={(e) => updateConfig('radius', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      );

    case 'gamma':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gamma ({effect.config.gamma?.value || 1.2})
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={effect.config.gamma?.value || 1.2}
              onChange={(e) => updateConfig('value', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      );

    case 'threshold':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Threshold ({effect.config.threshold?.value || 128})
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={effect.config.threshold?.value || 128}
              onChange={(e) => updateConfig('value', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      );

    case 'rgb-shift':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift Amount ({effect.config.rgbShift?.amount || 3}px)
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={effect.config.rgbShift?.amount || 3}
              onChange={(e) => updateConfig('amount', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      );

    case 'vignette':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vignette Strength ({effect.config.vignette?.strength || 50}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={effect.config.vignette?.strength || 50}
              onChange={(e) => updateConfig('strength', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      );

    case 'stippling':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Density ({effect.config.stippling?.density || 50}%)
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={effect.config.stippling?.density || 50}
              onChange={(e) => updateConfig('density', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dot Size ({effect.config.stippling?.dotSize || 2}px)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={effect.config.stippling?.dotSize || 2}
              onChange={(e) => updateConfig('dotSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      );

    case 'halftone':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dot Size ({effect.config.halftone?.dotSize || 4}px)
            </label>
            <input
              type="range"
              min="2"
              max="20"
              value={effect.config.halftone?.dotSize || 4}
              onChange={(e) => updateConfig('dotSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Angle ({effect.config.halftone?.angle || 45}°)
            </label>
            <input
              type="range"
              min="0"
              max="180"
              value={effect.config.halftone?.angle || 45}
              onChange={(e) => updateConfig('angle', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shape
            </label>
            <select
              value={effect.config.halftone?.shape || 'circle'}
              onChange={(e) => updateConfig('shape', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
            </select>
          </div>
        </div>
      );

    default:
      return null;
  }
};