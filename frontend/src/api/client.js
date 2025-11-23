import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Upload screenshots
  uploadScreenshots: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Generate previews
  generatePreviews: async (request) => {
    const response = await apiClient.post('/api/generate', request);
    return response.data;
  },

  // Get job status
  getJobStatus: async (jobId) => {
    const response = await apiClient.get(`/api/status/${jobId}`);
    return response.data;
  },

  // Get download URL
  getDownloadUrl: (previewId) => {
    return `${API_BASE_URL}/api/download/${previewId}`;
  },

  // Cleanup job
  cleanupJob: async (jobId) => {
    const response = await apiClient.delete(`/api/cleanup/${jobId}`);
    return response.data;
  },

  // Generate caption for screenshot
  generateCaption: async (screenshotId) => {
    const response = await apiClient.post(`/api/generate-caption/${screenshotId}`);
    return response.data;
  },

  // Edit preview with new caption
  editPreview: async (previewId, textOverlay) => {
    const response = await apiClient.post(`/api/edit-preview/${previewId}`, textOverlay);
    return response.data;
  },

  // Generate template preview
  generateTemplatePreview: async (templateId) => {
    const response = await apiClient.post('/api/generate-template-preview', { template_id: templateId });
    return response.data;
  },
};

export default apiClient;
