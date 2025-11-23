import React, { useState } from 'react';
import { Sparkles, Download, Undo, Redo, Crown } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { api } from '../api/client';

const Toolbar = () => {
  const { screenshots, settings, setCurrentJob, clearJob } = useAppStore();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (screenshots.length === 0) {
      alert('Please upload at least one screenshot');
      return;
    }

    setGenerating(true);
    clearJob();

    try {
      const request = {
        screenshots: screenshots.map((s) => ({
          id: s.id,
          textOverlay: s.textOverlay
        })),
        device_frame: settings.deviceFrame,
        background_type: settings.backgroundType,
        background_config: settings.backgroundConfig,
        positioning: settings.positioning,
        output_size: settings.outputSize,
      };

      const response = await api.generatePreviews(request);
      setCurrentJob(response.job_id);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to start generation. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-16 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-4">
      {/* Left - Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center font-bold text-white">
          A
        </div>
        <span className="font-semibold text-lg">AppLaunchpad</span>
      </div>

      {/* Center - Project Name */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
          <Undo className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
          <Redo className="w-5 h-5" />
        </button>
        <input
          type="text"
          defaultValue="Untitled Project"
          className="bg-transparent border-none outline-none text-center text-sm font-medium"
        />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Crown className="w-4 h-4" />
          Upgrade
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating || screenshots.length === 0}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate with FLUX
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
