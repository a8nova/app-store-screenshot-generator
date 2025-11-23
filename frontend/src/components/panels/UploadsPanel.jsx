import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { api } from '../../api/client';

const UploadsPanel = () => {
  const { screenshots, addScreenshots, removeScreenshot } = useAppStore();
  const [uploading, setUploading] = React.useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    try {
      const result = await api.uploadScreenshots(acceptedFiles);

      const filesWithPreviews = result.files.map((file, index) => ({
        ...file,
        preview: URL.createObjectURL(acceptedFiles[index]),
        file: acceptedFiles[index],
      }));

      addScreenshots(filesWithPreviews);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload screenshots');
    } finally {
      setUploading(false);
    }
  }, [addScreenshots]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: true,
  });

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Uploads</h2>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 hover:border-gray-600 hover:bg-[#2a2a2a]'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragActive ? 'text-blue-500' : 'text-gray-500'}`} />
        {uploading ? (
          <p className="text-sm text-gray-400">Uploading...</p>
        ) : (
          <>
            <p className="text-sm font-medium mb-1">
              {isDragActive ? 'Drop here' : 'Drag & drop screenshots'}
            </p>
            <p className="text-xs text-gray-500">or click to browse</p>
          </>
        )}
      </div>

      {/* Uploaded Screenshots */}
      {screenshots.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Uploaded ({screenshots.length})</h3>
          <div className="space-y-2">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.id}
                className="flex items-center gap-3 p-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors group"
              >
                <div className="w-12 h-16 bg-[#1a1a1a] rounded overflow-hidden flex-shrink-0">
                  <img
                    src={screenshot.preview}
                    alt={screenshot.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{screenshot.filename}</p>
                  <p className="text-xs text-gray-500">{(screenshot.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  onClick={() => removeScreenshot(screenshot.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadsPanel;
