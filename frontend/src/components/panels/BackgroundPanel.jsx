import React from 'react';
import useAppStore from '../../store/useAppStore';

const BackgroundPanel = () => {
  const { settings, updateSettings, updateBackgroundConfig } = useAppStore();

  const gradientPresets = [
    { name: 'Purple Dream', colors: ['#667eea', '#764ba2'] },
    { name: 'Sunset', colors: ['#f093fb', '#f5576c'] },
    { name: 'Ocean', colors: ['#4facfe', '#00f2fe'] },
    { name: 'Forest', colors: ['#56ab2f', '#a8e063'] },
    { name: 'Fire', colors: ['#f12711', '#f5af19'] },
    { name: 'Ice', colors: ['#a8edea', '#fed6e3'] },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Background</h2>

      <div className="space-y-4">
        {/* Background Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateSettings({ backgroundType: 'gradient' })}
              className={`px-4 py-2 rounded-lg transition-all ${
                settings.backgroundType === 'gradient'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
              }`}
            >
              Gradient
            </button>
            <button
              onClick={() => updateSettings({ backgroundType: 'solid' })}
              className={`px-4 py-2 rounded-lg transition-all ${
                settings.backgroundType === 'solid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
              }`}
            >
              Solid
            </button>
          </div>
        </div>

        {/* Gradient Presets */}
        {settings.backgroundType === 'gradient' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Gradient Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {gradientPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateBackgroundConfig({ colors: preset.colors })}
                    className="h-12 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                    }}
                  >
                    <span className="text-xs font-medium text-white drop-shadow-lg">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custom Colors</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start</label>
                  <input
                    type="color"
                    value={settings.backgroundConfig.colors[0]}
                    onChange={(e) => {
                      const newColors = [...settings.backgroundConfig.colors];
                      newColors[0] = e.target.value;
                      updateBackgroundConfig({ colors: newColors });
                    }}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End</label>
                  <input
                    type="color"
                    value={settings.backgroundConfig.colors[1]}
                    onChange={(e) => {
                      const newColors = [...settings.backgroundConfig.colors];
                      newColors[1] = e.target.value;
                      updateBackgroundConfig({ colors: newColors });
                    }}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Solid Color */}
        {settings.backgroundType === 'solid' && (
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <input
              type="color"
              value={settings.backgroundConfig.color || '#667eea'}
              onChange={(e) => updateBackgroundConfig({ color: e.target.value })}
              className="w-full h-16 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundPanel;
