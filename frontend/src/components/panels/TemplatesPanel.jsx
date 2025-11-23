import React from 'react';

const TemplatesPanel = () => {
  const templates = [
    { id: 1, name: 'Music App Dark', preview: '/templates/music-dark.png' },
    { id: 2, name: 'Music App Light', preview: '/templates/music-light.png' },
    { id: 3, name: 'E-commerce', preview: '/templates/ecommerce.png' },
    { id: 4, name: 'Social Media', preview: '/templates/social.png' },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Templates</h2>

      <div className="grid grid-cols-5 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            className="group relative aspect-[9/16] bg-[#2a2a2a] rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs font-medium text-white truncate">{template.name}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Categories</h3>
        <div className="space-y-1">
          {['Music Apps', 'E-commerce', 'Social Media', 'Productivity', 'Gaming'].map((category) => (
            <button
              key={category}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPanel;
