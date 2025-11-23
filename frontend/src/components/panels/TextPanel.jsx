import React from 'react';
import useAppStore from '../../store/useAppStore';

const TextPanel = ({ currentScreenshotId }) => {
  const { screenshots, updateScreenshotText } = useAppStore();

  const currentScreenshot = screenshots.find(s => s.id === currentScreenshotId);
  const textOverlay = currentScreenshot?.textOverlay;

  if (!currentScreenshot) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Text Overlay</h2>
        <p className="text-sm text-gray-500">Upload a screenshot first to add text</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Text Overlay</h2>
      <p className="text-xs text-gray-500 mb-4">For current screenshot</p>

      <div className="space-y-4">
        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Text</label>
          <textarea
            value={textOverlay?.text || ''}
            onChange={(e) => {
              if (e.target.value) {
                updateScreenshotText(currentScreenshotId, {
                  text: e.target.value,
                  position: textOverlay?.position || 'bottom',
                  font_size: textOverlay?.font_size || 80,
                  color: textOverlay?.color || '#FFFFFF',
                });
              } else {
                updateScreenshotText(currentScreenshotId, null);
              }
            }}
            placeholder="Enter caption for this screenshot..."
            className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
          />
        </div>

        {textOverlay && (
          <>
            {/* Position */}
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {['top', 'center', 'bottom'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateScreenshotText(currentScreenshotId, { ...textOverlay, position: pos })}
                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                      textOverlay.position === pos
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Font Size: {textOverlay.font_size}px
              </label>
              <input
                type="range"
                min="40"
                max="120"
                step="5"
                value={textOverlay.font_size}
                onChange={(e) =>
                  updateScreenshotText(currentScreenshotId, { ...textOverlay, font_size: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <input
                type="color"
                value={textOverlay.color}
                onChange={(e) => updateScreenshotText(currentScreenshotId, { ...textOverlay, color: e.target.value })}
                className="w-full h-12 rounded-lg cursor-pointer"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TextPanel;
