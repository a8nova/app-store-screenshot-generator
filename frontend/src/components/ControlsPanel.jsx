import React from 'react';
import {
  Smartphone,
  Palette,
  Move,
  Type,
  Sparkles,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';

const ControlsPanel = () => {
  const { settings, updateSettings, updatePositioning, updateBackgroundConfig, updateTextOverlay } = useAppStore();

  const deviceFrames = [
    { id: 'none', name: 'No Frame' },
    { id: 'iphone-15-pro', name: 'iPhone 15 Pro' },
    { id: 'iphone-15', name: 'iPhone 15' },
    { id: 'android', name: 'Android' },
    { id: 'ipad', name: 'iPad Pro' },
  ];

  const backgroundTypes = [
    { id: 'solid', name: 'Solid Color', icon: Palette },
    { id: 'gradient', name: 'Gradient', icon: Sparkles },
    { id: 'ai-generated', name: 'AI Generated', icon: Sparkles },
  ];

  const outputSizes = [
    { id: 'app-store', name: 'App Store (1290x2796)' },
    { id: 'play-store', name: 'Play Store (1080x1920)' },
    { id: 'ipad', name: 'iPad (2048x2732)' },
  ];

  return (
    <div className="space-y-6">
      {/* Device Frame */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Device Frame</h3>
        </div>
        <select
          value={settings.deviceFrame}
          onChange={(e) => updateSettings({ deviceFrame: e.target.value })}
          className="input"
        >
          {deviceFrames.map((frame) => (
            <option key={frame.id} value={frame.id}>
              {frame.name}
            </option>
          ))}
        </select>
      </div>

      {/* Background Settings */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Background</h3>
        </div>

        {/* Background Type */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {backgroundTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => updateSettings({ backgroundType: type.id })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.backgroundType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300 text-gray-700'
                  }`}
                >
                  <type.icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gradient Colors */}
          {settings.backgroundType === 'gradient' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Gradient Colors
              </label>
              <div className="flex gap-2">
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
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => updateBackgroundConfig({ colors: ['#667eea', '#764ba2'] })}
                  className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                >
                  Purple Dream
                </button>
                <button
                  onClick={() => updateBackgroundConfig({ colors: ['#f093fb', '#f5576c'] })}
                  className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-[#f093fb] to-[#f5576c] text-white"
                >
                  Sunset
                </button>
                <button
                  onClick={() => updateBackgroundConfig({ colors: ['#4facfe', '#00f2fe'] })}
                  className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white"
                >
                  Ocean
                </button>
              </div>
            </div>
          )}

          {/* Solid Color */}
          {settings.backgroundType === 'solid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="color"
                value={settings.backgroundConfig.color || '#667eea'}
                onChange={(e) => updateBackgroundConfig({ color: e.target.value })}
                className="w-full h-12 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* AI Generated */}
          {settings.backgroundType === 'ai-generated' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Prompt
              </label>
              <textarea
                value={settings.backgroundConfig.prompt || ''}
                onChange={(e) => updateBackgroundConfig({ prompt: e.target.value })}
                placeholder="Describe the background you want (e.g., 'Modern gradient with geometric shapes')"
                className="input min-h-[100px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Using fal.ai to generate custom backgrounds
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Positioning */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Move className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Positioning</h3>
        </div>

        <div className="space-y-4">
          {/* Scale */}
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Scale</span>
              <span className="text-blue-600">{(settings.positioning.scale * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={settings.positioning.scale}
              onChange={(e) => updatePositioning({ scale: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Rotation */}
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Rotation</span>
              <span className="text-blue-600">{settings.positioning.rotation}°</span>
            </label>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={settings.positioning.rotation}
              onChange={(e) => updatePositioning({ rotation: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* X Offset */}
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Horizontal Position</span>
              <span className="text-blue-600">{settings.positioning.x_offset}px</span>
            </label>
            <input
              type="range"
              min="-200"
              max="200"
              step="10"
              value={settings.positioning.x_offset}
              onChange={(e) => updatePositioning({ x_offset: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Y Offset */}
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Vertical Position</span>
              <span className="text-blue-600">{settings.positioning.y_offset}px</span>
            </label>
            <input
              type="range"
              min="-200"
              max="200"
              step="10"
              value={settings.positioning.y_offset}
              onChange={(e) => updatePositioning({ y_offset: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Shadow & Reflection */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.positioning.shadow}
                onChange={(e) => updatePositioning({ shadow: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Shadow</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.positioning.reflection}
                onChange={(e) => updatePositioning({ reflection: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Reflection</span>
            </label>
          </div>
        </div>
      </div>

      {/* Text Overlay */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-800">Text Overlay</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text (optional)
            </label>
            <input
              type="text"
              value={settings.textOverlay?.text || ''}
              onChange={(e) => {
                if (e.target.value) {
                  updateTextOverlay({
                    text: e.target.value,
                    position: settings.textOverlay?.position || 'top',
                    font_size: settings.textOverlay?.font_size || 80,
                    color: settings.textOverlay?.color || '#FFFFFF',
                  });
                } else {
                  updateTextOverlay(null);
                }
              }}
              placeholder="Enter text to display"
              className="input"
            />
          </div>

          {settings.textOverlay && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  value={settings.textOverlay.position}
                  onChange={(e) => updateTextOverlay({ ...settings.textOverlay, position: e.target.value })}
                  className="input"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size: {settings.textOverlay.font_size}px
                </label>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="5"
                  value={settings.textOverlay.font_size}
                  onChange={(e) => updateTextOverlay({ ...settings.textOverlay, font_size: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={settings.textOverlay.color}
                  onChange={(e) => updateTextOverlay({ ...settings.textOverlay, color: e.target.value })}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Output Size */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Output Size</h3>
        <select
          value={settings.outputSize}
          onChange={(e) => updateSettings({ outputSize: e.target.value })}
          className="input"
        >
          {outputSizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ControlsPanel;
