import React from 'react';
import { Copy, Trash, ChevronRight, ChevronLeft } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import PreviewResults from './PreviewResults';

const Canvas = ({ selectedFrameIndex }) => {
  const { screenshots, settings, currentJob } = useAppStore();

  const currentScreenshot = screenshots[selectedFrameIndex];

  if (currentJob) {
    return <PreviewResults />;
  }

  if (!currentScreenshot) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#3a3a3a] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">Use the + button at the bottom to add screenshots</p>
          <p className="text-gray-500 text-sm mt-2">or go to Uploads tab in the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-8 relative">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-2">
        <button
          className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
          title="Duplicate frame"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-[#2a2a2a] rounded transition-colors text-red-500"
          title="Delete frame"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Arrows */}
      {screenshots.length > 1 && (
        <>
          {selectedFrameIndex > 0 && (
            <button className="absolute left-4 p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {selectedFrameIndex < screenshots.length - 1 && (
            <button className="absolute right-4 p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-full transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </>
      )}

      {/* Screenshot Preview */}
      <div className="relative max-w-md">
        <img
          src={currentScreenshot.preview}
          alt={currentScreenshot.filename}
          className="w-full shadow-2xl rounded-lg"
        />

        {/* Text Overlay Preview */}
        {currentScreenshot.textOverlay && currentScreenshot.textOverlay.text && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`text-white font-bold text-center px-4 ${
              currentScreenshot.textOverlay.position === 'top' ? 'self-start mt-8' :
              currentScreenshot.textOverlay.position === 'bottom' ? 'self-end mb-8' :
              'self-center'
            }`}
            style={{
              fontSize: `${(currentScreenshot.textOverlay.font_size || 80) / 4}px`,
              color: currentScreenshot.textOverlay.color || '#FFFFFF',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
            >
              {currentScreenshot.textOverlay.text}
            </div>
          </div>
        )}

        {/* Dimensions Label */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] px-3 py-1 rounded text-xs text-gray-400">
          {currentScreenshot.filename}
        </div>
      </div>

      {/* Info Text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-gray-500">
          Preview only - Click "Generate with FLUX" for final quality
        </p>
      </div>
    </div>
  );
};

export default Canvas;
