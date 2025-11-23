import React, { useState } from 'react';
import { Grid3x3, Type, Palette, Upload, Sparkles } from 'lucide-react';
import TemplatesPanel from './panels/TemplatesPanel';
import TextPanel from './panels/TextPanel';
import BackgroundPanel from './panels/BackgroundPanel';
import UploadsPanel from './panels/UploadsPanel';

const Sidebar = ({ currentScreenshotId }) => {
  const [activeTab, setActiveTab] = useState('uploads');

  const tabs = [
    { id: 'templates', label: 'Templates', icon: Grid3x3 },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'background', label: 'Background', icon: Palette },
    { id: 'uploads', label: 'Uploads', icon: Upload },
  ];

  return (
    <div className="w-[400px] bg-[#1a1a1a] border-r border-gray-800 flex">
      {/* Tab Navigation */}
      <div className="w-16 bg-[#141414] border-r border-gray-800 flex flex-col items-center py-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
              }`}
              title={tab.label}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'templates' && <TemplatesPanel />}
        {activeTab === 'text' && <TextPanel currentScreenshotId={currentScreenshotId} />}
        {activeTab === 'background' && <BackgroundPanel />}
        {activeTab === 'uploads' && <UploadsPanel />}
      </div>
    </div>
  );
};

export default Sidebar;
