import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Uploaded screenshots - each has its own text overlay
  screenshots: [],

  // Global generation settings
  settings: {
    deviceFrame: 'iphone-15-pro',
    backgroundType: 'gradient',
    backgroundConfig: {
      colors: ['#667eea', '#764ba2'],
      prompt: '',
    },
    positioning: {
      scale: 0.85,
      rotation: 0,
      x_offset: 0,
      y_offset: 0,
      shadow: true,
      reflection: false,
    },
    outputSize: 'app-store',
  },

  // Generation job
  currentJob: null,
  jobStatus: null,
  generatedPreviews: [],

  // Actions
  addScreenshots: (files) => set((state) => ({
    screenshots: [...state.screenshots, ...files.map(f => ({
      ...f,
      textOverlay: null // Each screenshot has its own text
    }))],
  })),

  removeScreenshot: (id) => set((state) => ({
    screenshots: state.screenshots.filter((s) => s.id !== id),
  })),

  clearScreenshots: () => set({ screenshots: [] }),

  updateScreenshotText: (screenshotId, textOverlay) => set((state) => ({
    screenshots: state.screenshots.map(s =>
      s.id === screenshotId ? { ...s, textOverlay } : s
    ),
  })),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),

  updatePositioning: (positioning) => set((state) => ({
    settings: {
      ...state.settings,
      positioning: { ...state.settings.positioning, ...positioning },
    },
  })),

  updateBackgroundConfig: (config) => set((state) => ({
    settings: {
      ...state.settings,
      backgroundConfig: { ...state.settings.backgroundConfig, ...config },
    },
  })),

  setCurrentJob: (jobId) => set({ currentJob: jobId }),

  setJobStatus: (status) => set({ jobStatus: status }),

  setGeneratedPreviews: (previews) => set({ generatedPreviews: previews }),

  clearJob: () => set({
    currentJob: null,
    jobStatus: null,
    generatedPreviews: [],
  }),
}));

export default useAppStore;
