import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { api } from '../api/client';

const UploadZone = () => {
  const { screenshots, addScreenshots, removeScreenshot } = useAppStore();
  const [uploading, setUploading] = React.useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    try {
      const result = await api.uploadScreenshots(acceptedFiles);

      // Add uploaded files to state with preview URLs
      const filesWithPreviews = result.files.map((file, index) => ({
        ...file,
        preview: URL.createObjectURL(acceptedFiles[index]),
        file: acceptedFiles[index],
      }));

      addScreenshots(filesWithPreviews);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload screenshots. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [addScreenshots]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    multiple: true,
  });

  const handleRemove = (id) => {
    removeScreenshot(id);
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        {...getRootProps()}
        className={`card border-2 border-dashed cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-12">
          <Upload
            className={`w-16 h-16 mb-4 transition-colors ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`}
          />
          {uploading ? (
            <p className="text-lg font-semibold text-gray-600">Uploading...</p>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {isDragActive
                  ? 'Drop screenshots here'
                  : 'Drag & drop screenshots here'}
              </p>
              <p className="text-sm text-gray-500">
                or click to select files (PNG, JPG, WEBP)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Screenshots Gallery */}
      {screenshots.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Uploaded Screenshots ({screenshots.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.id}
                className="relative group aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <img
                  src={screenshot.preview}
                  alt={screenshot.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200">
                  <button
                    onClick={() => handleRemove(screenshot.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">
                    {screenshot.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {screenshots.length === 0 && !uploading && (
        <div className="text-center py-8">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No screenshots uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
