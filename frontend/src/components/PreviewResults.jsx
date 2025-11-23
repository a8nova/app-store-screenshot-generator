import React, { useEffect, useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { api } from '../api/client';

const PreviewResults = () => {
  const { currentJob, jobStatus, setJobStatus, generatedPreviews, setGeneratedPreviews } = useAppStore();
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!currentJob) return;

    const pollJobStatus = async () => {
      try {
        setPolling(true);
        const status = await api.getJobStatus(currentJob);
        setJobStatus(status);

        if (status.status === 'completed') {
          setGeneratedPreviews(status.results);
          setPolling(false);
        } else if (status.status === 'failed') {
          setPolling(false);
        } else {
          // Continue polling
          setTimeout(pollJobStatus, 2000);
        }
      } catch (error) {
        console.error('Failed to fetch job status:', error);
        setPolling(false);
      }
    };

    pollJobStatus();
  }, [currentJob, setJobStatus, setGeneratedPreviews]);

  const handleDownload = (previewId, index) => {
    const url = api.getDownloadUrl(previewId);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preview_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    generatedPreviews.forEach((preview, index) => {
      if (preview.preview_id) {
        setTimeout(() => {
          handleDownload(preview.preview_id, index);
        }, index * 500);
      }
    });
  };

  if (!currentJob && generatedPreviews.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Generated Previews</h2>
        {generatedPreviews.length > 0 && (
          <button
            onClick={handleDownloadAll}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download All
          </button>
        )}
      </div>

      {/* Job Status */}
      {jobStatus && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            {jobStatus.status === 'processing' || jobStatus.status === 'queued' ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    Processing... {jobStatus.completed_screenshots} of {jobStatus.total_screenshots}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${jobStatus.progress}%` }}
                    />
                  </div>
                </div>
              </>
            ) : jobStatus.status === 'completed' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-700">
                  Generation completed successfully!
                </p>
              </>
            ) : jobStatus.status === 'failed' ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm font-medium text-red-700">
                  Generation failed: {jobStatus.error}
                </p>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Preview Gallery */}
      {generatedPreviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedPreviews.map((preview, index) => (
            <div
              key={preview.preview_id || index}
              className="relative group bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              {preview.error ? (
                <div className="flex items-center justify-center p-8 bg-red-50">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-700">{preview.error}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="aspect-[9/16] relative">
                    <img
                      src={api.getDownloadUrl(preview.preview_id)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={() => handleDownload(preview.preview_id, index)}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 bg-white hover:bg-blue-50 text-blue-600 p-4 rounded-full shadow-lg"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-sm text-white font-medium">
                      Preview {index + 1}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviewResults;
