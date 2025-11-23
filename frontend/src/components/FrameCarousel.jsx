import React, { useRef } from 'react';
import { Plus } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { api } from '../api/client';

const FrameCarousel = ({ selectedFrameIndex, onSelectFrame }) => {
  const { screenshots, addScreenshots } = useAppStore();
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    console.log('File input changed', e.target.files);
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      console.log('Uploading files:', files);
      const result = await api.uploadScreenshots(files);
      console.log('Upload result:', result);

      const filesWithPreviews = result.files.map((file, index) => ({
        ...file,
        preview: URL.createObjectURL(files[index]),
        file: files[index],
      }));

      addScreenshots(filesWithPreviews);
      e.target.value = ''; // Reset input
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload screenshots');
    }
  };

  const handlePlusClick = () => {
    console.log('Plus button clicked');
    console.log('File input ref:', fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('Triggered file input click');
    } else {
      console.error('File input ref is null!');
    }
  };

  return (
    <div className="h-32 bg-[#1a1a1a] border-t border-gray-800 flex items-center px-4 gap-3 overflow-x-auto">
      {screenshots.map((screenshot, index) => (
        <button
          key={screenshot.id}
          onClick={() => onSelectFrame(index)}
          className={`flex-shrink-0 relative group ${
            selectedFrameIndex === index ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="w-20 h-24 bg-[#2a2a2a] rounded-lg overflow-hidden">
            <img
              src={screenshot.preview}
              alt={`Frame ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs ${
              selectedFrameIndex === index ? 'text-blue-500 font-semibold' : 'text-gray-400'
            }`}
          >
            #{index + 1}
          </div>
          {selectedFrameIndex === index && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
          )}
        </button>
      ))}

      {/* Add Frame Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
      <button
        onClick={handlePlusClick}
        className="flex-shrink-0 w-20 h-24 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg flex items-center justify-center transition-colors group"
      >
        <Plus className="w-8 h-8 text-gray-500 group-hover:text-gray-300" />
      </button>
    </div>
  );
};

export default FrameCarousel;
