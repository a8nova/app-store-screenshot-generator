import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Upload as UploadIcon, Settings, Wand2, Download, Edit2, X, Smartphone, Type, Image as ImageIcon, Palette, Maximize2, Languages } from 'lucide-react';
import useAppStore from './store/useAppStore';
import { api } from './api/client';

// Template presets
const TEMPLATES = [
  {
    id: 11,
    name: "Inspired by Weather App",
    description: "Blue sky gradient for weather apps",
    thumbnail: "linear-gradient(135deg, #4A90E2 0%, #50C9E8 100%)",
    settings: {
      deviceFrame: "iphone-15-pro",
      backgroundType: "gradient",
      backgroundConfig: { colors: ["#4A90E2", "#50C9E8"] },
      positioning: { scale: 0.85, rotation: -2, x_offset: 0, y_offset: 0, shadow: true, reflection: false },
      textPosition: "top",
      captionStyle: "Weather-focused top caption"
    },
    hasExamples: true,
    backendTemplateId: 2
  },
  {
    id: 12,
    name: "Inspired by Health App",
    description: "Bold red and black for health apps",
    thumbnail: "linear-gradient(135deg, #DC143C 0%, #000000 100%)",
    settings: {
      deviceFrame: "iphone-15-pro",
      backgroundType: "gradient",
      backgroundConfig: { colors: ["#DC143C", "#000000"] },
      positioning: { scale: 0.85, rotation: 2, x_offset: 0, y_offset: 0, shadow: true, reflection: false },
      textPosition: "top",
      captionStyle: "Health-focused top caption"
    },
    hasExamples: true,
    backendTemplateId: 3
  },
  {
    id: 13,
    name: "Inspired by Home App",
    description: "Clean white and yellow for home apps",
    thumbnail: "linear-gradient(135deg, #FFFACD 0%, #FFFFFF 100%)",
    settings: {
      deviceFrame: "iphone-15-pro",
      backgroundType: "gradient",
      backgroundConfig: { colors: ["#FFFACD", "#FFFFFF"] },
      positioning: { scale: 0.85, rotation: 0, x_offset: 0, y_offset: 0, shadow: true, reflection: false },
      textPosition: "top",
      captionStyle: "Home automation top caption"
    },
    hasExamples: true,
    backendTemplateId: 4
  },
  {
    id: 14,
    name: "Inspired by Philz Coffee",
    description: "Warm brown tones for coffee apps",
    thumbnail: "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)",
    settings: {
      deviceFrame: "iphone-15-pro",
      backgroundType: "gradient",
      backgroundConfig: { colors: ["#8B4513", "#D2691E"] },
      positioning: { scale: 0.85, rotation: 0, x_offset: 0, y_offset: 0, shadow: true, reflection: false },
      textPosition: "top",
      captionStyle: "Coffee-focused top caption"
    },
    hasExamples: true,
    backendTemplateId: 5
  },
  {
    id: 15,
    name: "Inspired by Roku TV",
    description: "Purple gradient for streaming apps",
    thumbnail: "linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)",
    settings: {
      deviceFrame: "iphone-15-pro",
      backgroundType: "gradient",
      backgroundConfig: { colors: ["#6A1B9A", "#9C27B0"] },
      positioning: { scale: 0.85, rotation: 0, x_offset: 0, y_offset: 0, shadow: true, reflection: false },
      textPosition: "top",
      captionStyle: "Streaming-focused top caption"
    },
    hasExamples: true,
    backendTemplateId: 6
  },
  {
    id: 16,
    name: "Inspired by News App",
    description: "Red and yellow for news apps",
    thumbnail: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
    settings: {
      deviceFrame: "iphone-15-pro",
      backgroundType: "gradient",
      backgroundConfig: { colors: ["#FF6B6B", "#FFE66D"] },
      positioning: { scale: 0.85, rotation: 10, x_offset: 0, y_offset: 0, shadow: true, reflection: false },
      textPosition: "bottom",
      captionStyle: "News-focused bottom caption"
    },
    hasExamples: true,
    backendTemplateId: 7
  }
];

function App() {
  const { screenshots, settings, addScreenshots, updateScreenshotText, updateSettings, updateBackgroundConfig, updatePositioning, setCurrentJob, setJobStatus, setGeneratedPreviews, currentJob, jobStatus, generatedPreviews } = useAppStore();
  const [activeTab, setActiveTab] = useState('preview');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingCaptions, setGeneratingCaptions] = useState({});
  const [generatingAllCaptions, setGeneratingAllCaptions] = useState(false);
  const [editingPreview, setEditingPreview] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [editPosition, setEditPosition] = useState('top');
  const [editingInProgress, setEditingInProgress] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templatePreviews, setTemplatePreviews] = useState({});
  const [generatingTemplatePreviews, setGeneratingTemplatePreviews] = useState({});
  const [viewingTemplatePreview, setViewingTemplatePreview] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingScreenshots, setEditingScreenshots] = useState([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [currentProject, setCurrentProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState([]);
  const [editorSettings, setEditorSettings] = useState({
    device: 'iphone-15-pro',
    text: '',
    textPosition: 'top',
    textColor: 'white',
    backgroundType: 'gradient',
    gradientColors: ['#667eea', '#764ba2'],
    solidColor: '#ffffff',
    backgroundImage: null,
    backgroundImageId: null,
    rotation: 0
  });
  const [applyToAll, setApplyToAll] = useState(false);
  const [screenshotEdits, setScreenshotEdits] = useState({});
  const [dirtyScreenshots, setDirtyScreenshots] = useState(new Set());
  const [activeEditorSection, setActiveEditorSection] = useState('devices');
  const [generatingEditedPreview, setGeneratingEditedPreview] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [viewingGeneratedPreviews, setViewingGeneratedPreviews] = useState(false);
  const [viewingProjectPreview, setViewingProjectPreview] = useState(null);

  // Create refs for each template section
  const templateRefs = useRef({});

  // Update editor settings when current screenshot changes
  useEffect(() => {
    if (editingScreenshots.length > 0 && editingTemplate) {
      const currentPreview = editingScreenshots[currentScreenshotIndex];
      const savedEdit = screenshotEdits[currentScreenshotIndex];

      setEditorSettings({
        device: savedEdit?.device || editingTemplate.settings.deviceFrame,
        text: savedEdit?.text || currentPreview.caption,
        textPosition: savedEdit?.textPosition || editingTemplate.settings.textPosition || 'top',
        backgroundType: savedEdit?.backgroundType || editingTemplate.settings.backgroundType,
        gradientColors: savedEdit?.gradientColors || editingTemplate.settings.backgroundConfig.colors || ['#667eea', '#764ba2'],
        solidColor: savedEdit?.solidColor || editingTemplate.settings.backgroundConfig.color || '#ffffff',
        backgroundImage: null,
        rotation: savedEdit?.rotation ?? editingTemplate.settings.positioning?.rotation ?? 0
      });
    }
  }, [currentScreenshotIndex, editingScreenshots, editingTemplate, screenshotEdits]);

  // Auto-load all template previews and projects on mount
  useEffect(() => {
    const loadAllTemplatePreviews = async () => {
      const templatesWithExamples = TEMPLATES.filter(t => t.hasExamples);

      for (const template of templatesWithExamples) {
        const templateId = template.backendTemplateId;

        // Skip if already loaded or generating
        if (templatePreviews[templateId] || generatingTemplatePreviews[templateId]) {
          continue;
        }

        setGeneratingTemplatePreviews(prev => ({ ...prev, [templateId]: true }));

        try {
          const response = await api.generateTemplatePreview(templateId);
          setTemplatePreviews(prev => ({ ...prev, [templateId]: response.previews }));
        } catch (error) {
          console.error(`Failed to load template ${templateId}:`, error);
        } finally {
          setGeneratingTemplatePreviews(prev => ({ ...prev, [templateId]: false }));
        }
      }
    };

    loadAllTemplatePreviews();
    loadProjects();
  }, []); // Only run once on mount

  // Poll for job status
  useEffect(() => {
    if (!currentJob) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await api.getJobStatus(currentJob);
        setJobStatus(status);

        if (status.status === 'completed') {
          setGeneratedPreviews(status.results);
          clearInterval(pollInterval);
        } else if (status.status === 'failed') {
          alert('Generation failed: ' + status.error);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [currentJob, setJobStatus, setGeneratedPreviews]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const result = await api.uploadScreenshots(files);
      const filesWithPreviews = result.files.map((file, index) => ({
        ...file,
        preview: URL.createObjectURL(files[index]),
        file: files[index],
        textOverlay: null,
      }));

      // Automatically load into editor after upload
      const screenshotsForEditor = filesWithPreviews.map((screenshot, idx) => ({
        screenshot_path: screenshot.path,
        preview_id: screenshot.id,
        caption: `Screenshot ${idx + 1}`,
        preview: screenshot.preview
      }));

      setEditingScreenshots(screenshotsForEditor);
      setCurrentScreenshotIndex(0);
      setScreenshotEdits({});
      setDirtyScreenshots(new Set());
      setProjectName(`Project ${new Date().toLocaleDateString()}`);

      // Set initial template settings
      setEditingTemplate({
        name: 'Custom Upload',
        settings: {
          deviceFrame: 'iphone-15-pro',
          textPosition: 'top',
          backgroundType: 'gradient',
          backgroundConfig: {
            colors: ['#667eea', '#764ba2']
          },
          positioning: {
            rotation: 0
          }
        },
        backendTemplateId: null
      });

      setEditorSettings({
        device: 'iphone-15-pro',
        text: screenshotsForEditor[0]?.caption || '',
        textPosition: 'top',
        textColor: 'white',
        backgroundType: 'gradient',
        gradientColors: ['#667eea', '#764ba2'],
        solidColor: '#ffffff',
        backgroundImage: null,
        backgroundImageId: null,
        rotation: 0
      });

      // Switch directly to editor
      setActiveTab('editor');
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateCaption = async (screenshotId) => {
    setGeneratingCaptions(prev => ({ ...prev, [screenshotId]: true }));
    try {
      const result = await api.generateCaption(screenshotId);
      if (result.success) {
        updateScreenshotText(screenshotId, {
          text: result.caption,
          position: result.position,
          font_size: result.font_size,
          color: result.color,
        });
      }
    } catch (error) {
      alert('Caption generation failed');
    } finally {
      setGeneratingCaptions(prev => ({ ...prev, [screenshotId]: false }));
    }
  };

  const handleGenerateAllCaptions = async () => {
    setGeneratingAllCaptions(true);

    // Mark all as generating
    const generatingState = {};
    screenshots.forEach(s => {
      generatingState[s.id] = true;
    });
    setGeneratingCaptions(generatingState);

    try {
      // Generate all captions concurrently
      const promises = screenshots.map(screenshot =>
        api.generateCaption(screenshot.id)
          .then(result => {
            if (result.success) {
              updateScreenshotText(screenshot.id, {
                text: result.caption,
                position: result.position,
                font_size: result.font_size,
                color: result.color,
              });
            }
            return { id: screenshot.id, success: true };
          })
          .catch(error => {
            console.error(`Failed to generate caption for ${screenshot.id}:`, error);
            return { id: screenshot.id, success: false };
          })
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to generate all captions:', error);
    } finally {
      setGeneratingCaptions({});
      setGeneratingAllCaptions(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const request = {
        screenshots: screenshots.map((s) => ({
          id: s.id,
          textOverlay: s.textOverlay,
        })),
        device_frame: settings.deviceFrame,
        background_type: settings.backgroundType,
        background_config: settings.backgroundConfig,
        positioning: settings.positioning,
        output_size: settings.outputSize,
      };

      const response = await api.generatePreviews(request);
      setCurrentJob(response.job_id);
      setActiveTab('results');
    } catch (error) {
      alert('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleEditPreview = (preview) => {
    setEditingPreview(preview);
    setEditCaption('');
    setEditPosition('top');
  };

  const handleSaveEdit = async () => {
    if (!editCaption.trim()) {
      alert('Please enter a caption');
      return;
    }

    setEditingInProgress(true);
    try {
      const result = await api.editPreview(editingPreview.preview_id, {
        text: editCaption,
        position: editPosition,
        font_size: 80,
        color: '#FFFFFF',
      });

      if (result.success) {
        // Force reload the image by adding timestamp
        const updatedPreviews = generatedPreviews.map(p =>
          p.preview_id === editingPreview.preview_id
            ? { ...p, timestamp: Date.now() }
            : p
        );
        setGeneratedPreviews(updatedPreviews);
        setEditingPreview(null);
      }
    } catch (error) {
      alert('Edit failed: ' + error.message);
    } finally {
      setEditingInProgress(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    // Apply template settings
    updateSettings({
      deviceFrame: template.settings.deviceFrame,
      backgroundType: template.settings.backgroundType,
    });
    updateBackgroundConfig(template.settings.backgroundConfig);
    updatePositioning(template.settings.positioning);
    setShowTemplates(false);
  };

  const handleViewTemplateExamples = async (templateId) => {
    // Find template info
    const template = TEMPLATES.find(t => (t.backendTemplateId || t.id) === templateId);

    // If already have previews, just show them
    if (templatePreviews[templateId]) {
      setViewingTemplatePreview({
        id: templateId,
        previews: templatePreviews[templateId],
        name: template?.name || 'Template',
        description: template?.description || ''
      });
      return;
    }

    // Generate previews
    setGeneratingTemplatePreviews(prev => ({ ...prev, [templateId]: true }));
    try {
      const result = await api.generateTemplatePreview(templateId);
      if (result.success) {
        setTemplatePreviews(prev => ({
          ...prev,
          [templateId]: result.previews
        }));
        setViewingTemplatePreview({
          id: templateId,
          previews: result.previews,
          name: template?.name || 'Template',
          description: template?.description || ''
        });
      }
    } catch (error) {
      alert('Failed to generate template previews: ' + error.message);
    } finally {
      setGeneratingTemplatePreviews(prev => ({ ...prev, [templateId]: false }));
    }
  };

  // Save current edits for the screenshot
  const saveCurrentEdit = () => {
    setScreenshotEdits(prev => ({
      ...prev,
      [currentScreenshotIndex]: {
        ...editorSettings
      }
    }));
  };

  // Apply settings change and optionally to all screenshots
  const handleSettingsChange = (newSettings) => {
    setEditorSettings(newSettings);

    if (applyToAll) {
      // Apply background settings to all screenshots
      const updatedEdits = {};
      const newDirty = new Set(dirtyScreenshots);
      editingScreenshots.forEach((_, idx) => {
        updatedEdits[idx] = {
          ...(screenshotEdits[idx] || {}),
          backgroundType: newSettings.backgroundType,
          gradientColors: newSettings.gradientColors,
          solidColor: newSettings.solidColor,
          rotation: newSettings.rotation
        };
        newDirty.add(idx);
      });
      setScreenshotEdits(prev => ({ ...prev, ...updatedEdits }));
      setDirtyScreenshots(newDirty);
    } else {
      // Save for current screenshot only
      setScreenshotEdits(prev => ({
        ...prev,
        [currentScreenshotIndex]: newSettings
      }));
      setDirtyScreenshots(prev => new Set(prev).add(currentScreenshotIndex));
    }
  };

  const handleGenerateEditedPreviews = async () => {
    if (!editingTemplate || editingScreenshots.length === 0) {
      alert('No screenshots to generate');
      return;
    }

    const editedIndices = Array.from(dirtyScreenshots);
    if (editedIndices.length === 0) {
      alert('No edited screenshots to regenerate');
      return;
    }

    // Save current edits before generating
    saveCurrentEdit();

    setGeneratingEditedPreview(true);
    console.log(`🚀 Starting parallel generation of ${editedIndices.length} edited screenshots...`);

    try {
      const updatedScreenshots = [...editingScreenshots];

      // Generate all edited screenshots in parallel
      const generationPromises = editedIndices.map(async (idx) => {
        console.log(`📤 Sending request for edited screenshot ${idx + 1}`);
        const screenshot = editingScreenshots[idx];
        const edit = screenshotEdits[idx] || {};

        // Use edited settings or fallback to current/template settings
        const backgroundType = edit.backgroundType || editingTemplate.settings.backgroundType;
        const settings = {
          caption: edit.text || screenshot.caption,
          text_position: edit.textPosition || editingTemplate.settings.textPosition || 'top',
          text_color: edit.textColor || 'white',
          device_frame: edit.device || editingTemplate.settings.deviceFrame,
          background_type: backgroundType,
          background_config: backgroundType === 'gradient'
            ? { colors: edit.gradientColors || editingTemplate.settings.backgroundConfig.colors }
            : backgroundType === 'solid'
            ? { color: edit.solidColor || editingTemplate.settings.backgroundConfig.color }
            : {},
          positioning: {
            ...editingTemplate.settings.positioning,
            rotation: edit.rotation ?? editingTemplate.settings.positioning?.rotation ?? 0
          },
          background_image_id: backgroundType === 'image' ? edit.backgroundImageId : null
        };

        try {
          const response = await fetch('http://localhost:8000/api/edit-preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              screenshot_path: screenshot.screenshot_path,
              ...settings
            })
          });

          const result = await response.json();
          if (result.success) {
            return {
              idx,
              success: true,
              data: {
                ...screenshot,
                preview_id: result.preview_id,
                caption: settings.caption
              }
            };
          } else {
            return { idx, success: false, error: 'Generation failed' };
          }
        } catch (error) {
          console.error(`Failed to generate screenshot ${idx + 1}:`, error);
          return { idx, success: false, error: error.message };
        }
      });

      // Wait for all generations to complete
      console.log(`⏳ Waiting for all ${generationPromises.length} parallel requests to complete...`);
      const results = await Promise.all(generationPromises);
      console.log(`✅ All edited screenshot requests completed!`);

      // Update screenshots with results
      let successCount = 0;
      let failCount = 0;
      results.forEach(result => {
        if (result.success) {
          updatedScreenshots[result.idx] = {
            ...result.data,
            preview: null  // Clear blob URL so it uses preview_id instead
          };
          successCount++;
        } else {
          failCount++;
        }
      });

      setEditingScreenshots(updatedScreenshots);
      setDirtyScreenshots(new Set()); // Clear dirty state after successful generation
      console.log(`📊 Regeneration results: ${successCount} succeeded, ${failCount} failed`);

      // Show preview modal
      setViewingGeneratedPreviews(true);
    } catch (error) {
      console.error('❌ Regeneration error:', error);
      alert('Failed to generate previews: ' + error.message);
    } finally {
      setGeneratingEditedPreview(false);
    }
  };

  const handleGenerateAllPreviews = async () => {
    if (!editingTemplate || editingScreenshots.length === 0) {
      alert('No screenshots to generate');
      return;
    }

    // Save current edits before generating
    saveCurrentEdit();

    setGeneratingEditedPreview(true);
    console.log(`🚀 Starting parallel generation of ${editingScreenshots.length} screenshots...`);

    try {
      const updatedScreenshots = [...editingScreenshots];

      // Generate all screenshots in parallel
      const generationPromises = editingScreenshots.map(async (screenshot, idx) => {
        console.log(`📤 Sending request ${idx + 1}/${editingScreenshots.length}`);
        const edit = screenshotEdits[idx] || {};

        // Use edited settings or fallback to current/template settings
        const backgroundType = edit.backgroundType || editingTemplate.settings.backgroundType;
        const settings = {
          caption: edit.text || screenshot.caption,
          text_position: edit.textPosition || editingTemplate.settings.textPosition || 'top',
          text_color: edit.textColor || 'white',
          device_frame: edit.device || editingTemplate.settings.deviceFrame,
          background_type: backgroundType,
          background_config: backgroundType === 'gradient'
            ? { colors: edit.gradientColors || editingTemplate.settings.backgroundConfig.colors }
            : backgroundType === 'solid'
            ? { color: edit.solidColor || editingTemplate.settings.backgroundConfig.color }
            : {},
          positioning: {
            ...editingTemplate.settings.positioning,
            rotation: edit.rotation ?? editingTemplate.settings.positioning?.rotation ?? 0
          },
          background_image_id: backgroundType === 'image' ? edit.backgroundImageId : null
        };

        try {
          const response = await fetch('http://localhost:8000/api/edit-preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              screenshot_path: screenshot.screenshot_path,
              ...settings
            })
          });

          const result = await response.json();
          if (result.success) {
            return {
              idx,
              success: true,
              data: {
                ...screenshot,
                preview_id: result.preview_id,
                caption: settings.caption
              }
            };
          } else {
            return { idx, success: false, error: 'Generation failed' };
          }
        } catch (error) {
          console.error(`Failed to generate screenshot ${idx + 1}:`, error);
          return { idx, success: false, error: error.message };
        }
      });

      // Wait for all generations to complete
      console.log(`⏳ Waiting for all ${generationPromises.length} parallel requests to complete...`);
      const results = await Promise.all(generationPromises);
      console.log(`✅ All requests completed!`);

      // Update screenshots with results
      let successCount = 0;
      let failCount = 0;
      results.forEach(result => {
        if (result.success) {
          updatedScreenshots[result.idx] = {
            ...result.data,
            preview: null  // Clear blob URL so it uses preview_id instead
          };
          successCount++;
        } else {
          failCount++;
        }
      });

      setEditingScreenshots(updatedScreenshots);
      setDirtyScreenshots(new Set()); // Clear dirty state after successful generation
      console.log(`📊 Generation results: ${successCount} succeeded, ${failCount} failed`);

      // Show preview modal
      setViewingGeneratedPreviews(true);
    } catch (error) {
      console.error('❌ Generation error:', error);
      alert('Failed to generate previews: ' + error.message);
    } finally {
      setGeneratingEditedPreview(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    if (editingScreenshots.length === 0) {
      alert('No screenshots to save');
      return;
    }

    // Save current edits before saving project
    saveCurrentEdit();

    setSavingProject(true);
    try {
      // Build screenshots with their individual settings
      const screenshotsWithSettings = editingScreenshots.map((screenshot, idx) => {
        const edit = screenshotEdits[idx] || {};
        return {
          ...screenshot,
          individual_settings: {
            device: edit.device || editingTemplate.settings.deviceFrame,
            text: edit.text || screenshot.caption,
            textPosition: edit.textPosition || editingTemplate.settings.textPosition || 'top',
            textColor: edit.textColor || 'white',
            backgroundType: edit.backgroundType || editingTemplate.settings.backgroundType,
            gradientColors: edit.gradientColors || editingTemplate.settings.backgroundConfig.colors || ['#667eea', '#764ba2'],
            solidColor: edit.solidColor || editingTemplate.settings.backgroundConfig.color || '#ffffff',
            backgroundImageId: edit.backgroundImageId || null,
            rotation: edit.rotation ?? editingTemplate.settings.positioning?.rotation ?? 0
          }
        };
      });

      const response = await fetch('http://localhost:8000/api/save-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject?.id || null,
          name: projectName,
          template_id: editingTemplate.backendTemplateId,
          screenshots: screenshotsWithSettings,
          screenshot_edits: screenshotEdits,
          settings: {
            device: editorSettings.device,
            backgroundType: editorSettings.backgroundType,
            backgroundConfig: editorSettings.backgroundType === 'gradient'
              ? { colors: editorSettings.gradientColors }
              : { color: editorSettings.solidColor },
            positioning: editingTemplate.settings.positioning
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setCurrentProject(result.project);
        setDirtyScreenshots(new Set()); // Clear dirty state after save
        alert('Project saved successfully!');
        // Refresh projects list
        loadProjects();
      } else {
        alert('Failed to save project: ' + result.error);
      }
    } catch (error) {
      alert('Failed to save project: ' + error.message);
    } finally {
      setSavingProject(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/projects');
      const result = await response.json();
      if (result.success) {
        setSavedProjects(result.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  // Show results page when job exists
  if (currentJob && jobStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">App Store Preview Generator</h1>
                  <p className="text-xs text-gray-400">Powered by FLUX AI</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
            <h2 className="text-3xl font-bold mb-4">Your Generated Previews</h2>
            {jobStatus.status === 'processing' && (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span>
                  Generating {jobStatus.completed_screenshots} of {jobStatus.total_screenshots}...
                </span>
              </div>
            )}
            {jobStatus.status === 'completed' && generatedPreviews.length > 0 && (
              <div>
                <div className="grid grid-cols-3 gap-6">
                  {generatedPreviews.map((preview, i) => (
                    <div key={preview.preview_id} className="bg-white/5 rounded-xl p-4">
                      <img
                        src={`${api.getDownloadUrl(preview.preview_id)}?t=${preview.timestamp || Date.now()}`}
                        alt={`Preview ${i + 1}`}
                        className="w-full rounded-lg shadow-lg mb-4"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPreview(preview)}
                          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-center font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <a
                          href={api.getDownloadUrl(preview.preview_id)}
                          download={`preview_${i + 1}.png`}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setCurrentJob(null);
                    setJobStatus(null);
                    setGeneratedPreviews([]);
                  }}
                  className="mt-8 px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold transition-all"
                >
                  Generate More
                </button>
              </div>
            )}
          </div>

          {/* Edit Modal */}
          {editingPreview && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 rounded-2xl border border-white/20 p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Edit Caption</h3>
                  <button
                    onClick={() => setEditingPreview(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Caption Text</label>
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="e.g., 'Design your dream outfit in MINUTES!'"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      rows="3"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Position</label>
                    <select
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg"
                    >
                      <option value="top">Top</option>
                      <option value="center">Center</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setEditingPreview(null)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={editingInProgress || !editCaption.trim()}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {editingInProgress ? 'Generating...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* LEFT SIDEBAR - Templates */}
      <aside className="w-80 bg-black/30 backdrop-blur-md border-r border-white/10 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Templates</h1>
                <p className="text-xs text-gray-400">Select a template</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  handleSelectTemplate(template);
                  setActiveTab('preview'); // Switch to preview tab

                  // Scroll to the template section
                  setTimeout(() => {
                    const templateElement = templateRefs.current[template.backendTemplateId];
                    if (templateElement) {
                      templateElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }, 100);
                }}
                className={`w-full text-left bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-all border-2 ${
                  selectedTemplate?.id === template.id
                    ? 'border-purple-500'
                    : 'border-transparent hover:border-white/20'
                }`}
              >
                {/* Show actual preview if available, otherwise gradient */}
                {template.hasExamples && templatePreviews[template.backendTemplateId] ? (
                  <div className="w-full h-24 rounded-lg mb-2 overflow-hidden bg-black/20">
                    <img
                      src={api.getDownloadUrl(templatePreviews[template.backendTemplateId][0].preview_id)}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-24 rounded-lg mb-2 flex items-center justify-center"
                    style={{ background: template.thumbnail }}
                  >
                    <div className="w-10 h-16 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-2xl" />
                  </div>
                )}
                <h3 className="font-bold text-sm mb-1">{template.name}</h3>
                <p className="text-xs text-gray-400">{template.description}</p>
                {selectedTemplate?.id === template.id && (
                  <div className="mt-2 text-xs text-purple-400 font-semibold">✓ Selected</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN AREA - Preview & Upload */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              Template Preview
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              My Projects
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              Upload & Generate
            </button>
          </div>

          {/* Template Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-8">
              {TEMPLATES.filter(t => t.hasExamples).map((template) => {
                const previews = templatePreviews[template.backendTemplateId];
                const isGenerating = generatingTemplatePreviews[template.backendTemplateId];

                return (
                  <div
                    key={template.id}
                    ref={(el) => templateRefs.current[template.backendTemplateId] = el}
                    className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6"
                  >
                    <h3 className="text-2xl font-bold mb-4">{template.name}</h3>

                    {previews ? (
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {previews.map((preview, idx) => (
                          <button
                            key={preview.preview_id}
                            onClick={() => {
                              // Load all screenshots from this template
                              setEditingTemplate(template);
                              setEditingScreenshots(previews);
                              setCurrentScreenshotIndex(idx);
                              setScreenshotEdits({}); // Clear any previous edits
                              setDirtyScreenshots(new Set()); // Clear dirty state
                              setEditorSettings({
                                device: template.settings.deviceFrame,
                                text: preview.caption,
                                textPosition: template.settings.textPosition || 'top',
                                backgroundType: template.settings.backgroundType,
                                gradientColors: template.settings.backgroundConfig.colors || ['#667eea', '#764ba2'],
                                solidColor: template.settings.backgroundConfig.color || '#ffffff',
                                backgroundImage: null
                              });
                              setActiveTab('editor');
                            }}
                            className="flex-shrink-0 w-64 text-left hover:scale-105 transition-transform cursor-pointer"
                          >
                            <div className="relative aspect-[9/19.5] mb-3">
                              <img
                                src={api.getDownloadUrl(preview.preview_id)}
                                alt={preview.caption}
                                className="w-full h-full object-cover rounded-xl shadow-2xl"
                              />
                            </div>
                            <p className="text-sm text-center text-gray-300 font-semibold">
                              {preview.caption}
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : isGenerating ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-3"></div>
                          <p className="text-gray-400 text-sm">Generating previews...</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* Editor Tab */}
          {activeTab === 'editor' && (
            <div className="flex gap-6 h-[calc(100vh-200px)]">
              {/* Left Sidebar - Editor Controls */}
              <div className="w-20 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center py-4 gap-2">
                <button
                  onClick={() => setActiveEditorSection('devices')}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    activeEditorSection === 'devices'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                  title="Devices"
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-[9px]">Devices</span>
                </button>
                <button
                  onClick={() => setActiveEditorSection('text')}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    activeEditorSection === 'text'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                  title="Text"
                >
                  <Type className="w-5 h-5" />
                  <span className="text-[9px]">Text</span>
                </button>
                <button
                  onClick={() => setActiveEditorSection('background')}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    activeEditorSection === 'background'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                  title="Background"
                >
                  <Palette className="w-5 h-5" />
                  <span className="text-[9px]">Background</span>
                </button>
                <button
                  onClick={() => setActiveEditorSection('position')}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    activeEditorSection === 'position'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                  title="Position"
                >
                  <Maximize2 className="w-5 h-5" />
                  <span className="text-[9px]">Position</span>
                </button>
              </div>

              {/* Middle Panel - Section Controls */}
              <div className="w-80 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 overflow-y-auto">
                {activeEditorSection === 'devices' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Device Frame</h3>
                    <div className="space-y-2">
                      {['iphone-15-pro', 'iphone-14', 'iphone-13'].map((device) => (
                        <button
                          key={device}
                          onClick={() => {
                            const newSettings = { ...editorSettings, device };
                            setEditorSettings(newSettings);
                            setScreenshotEdits(prev => ({
                              ...prev,
                              [currentScreenshotIndex]: newSettings
                            }));
                            setDirtyScreenshots(prev => new Set(prev).add(currentScreenshotIndex));
                          }}
                          className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                            editorSettings.device === device
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          {device.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeEditorSection === 'text' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Text Overlay</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">Caption Text</label>
                          <button
                            onClick={async () => {
                              const currentScreenshot = editingScreenshots[currentScreenshotIndex];
                              if (!currentScreenshot || !currentScreenshot.screenshot_path) return;

                              setGeneratingCaptions(prev => ({ ...prev, [currentScreenshot.preview_id]: true }));
                              try {
                                const result = await api.generateCaption(currentScreenshot.preview_id);
                                const newSettings = { ...editorSettings, text: result.caption };
                                setEditorSettings(newSettings);
                                setScreenshotEdits(prev => ({
                                  ...prev,
                                  [currentScreenshotIndex]: newSettings
                                }));
                                setDirtyScreenshots(prev => new Set(prev).add(currentScreenshotIndex));
                              } catch (error) {
                                console.error('Failed to generate caption:', error);
                                alert('Failed to generate caption. Please try again.');
                              } finally {
                                setGeneratingCaptions(prev => ({ ...prev, [currentScreenshot.preview_id]: false }));
                              }
                            }}
                            disabled={generatingCaptions[editingScreenshots[currentScreenshotIndex]?.preview_id]}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <Sparkles className="w-3 h-3" />
                            {generatingCaptions[editingScreenshots[currentScreenshotIndex]?.preview_id] ? 'Generating...' : 'Generate'}
                          </button>
                        </div>
                        <textarea
                          value={editorSettings.text}
                          onChange={(e) => {
                            const newSettings = { ...editorSettings, text: e.target.value };
                            setEditorSettings(newSettings);
                            setScreenshotEdits(prev => ({
                              ...prev,
                              [currentScreenshotIndex]: newSettings
                            }));
                            setDirtyScreenshots(prev => new Set(prev).add(currentScreenshotIndex));
                          }}
                          placeholder="Enter your caption..."
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
                          rows="3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Position</label>
                        <select
                          value={editorSettings.textPosition}
                          onChange={(e) => {
                            const newSettings = { ...editorSettings, textPosition: e.target.value };
                            setEditorSettings(newSettings);
                            setScreenshotEdits(prev => ({
                              ...prev,
                              [currentScreenshotIndex]: newSettings
                            }));
                            setDirtyScreenshots(prev => new Set(prev).add(currentScreenshotIndex));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg"
                        >
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Text Color</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              const newSettings = { ...editorSettings, textColor: 'white' };
                              setEditorSettings(newSettings);
                              setScreenshotEdits(prev => ({
                                ...prev,
                                [currentScreenshotIndex]: newSettings
                              }));
                              setDirtyScreenshots(prev => new Set(prev).add(currentScreenshotIndex));
                            }}
                            className={`px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                              editorSettings.textColor === 'white'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="w-4 h-4 bg-white rounded-full border border-gray-400"></div>
                            White
                          </button>
                          <button
                            onClick={() => {
                              const newSettings = { ...editorSettings, textColor: 'black' };
                              setEditorSettings(newSettings);
                              setScreenshotEdits(prev => ({
                                ...prev,
                                [currentScreenshotIndex]: newSettings
                              }));
                              setDirtyScreenshots(prev => new Set(prev).add(currentScreenshotIndex));
                            }}
                            className={`px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                              editorSettings.textColor === 'black'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="w-4 h-4 bg-black rounded-full border border-gray-600"></div>
                            Black
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeEditorSection === 'background' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Background</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            const newSettings = { ...editorSettings, backgroundType: 'gradient' };
                            handleSettingsChange(newSettings);
                          }}
                          className={`px-3 py-2 rounded-lg transition-all text-sm ${
                            editorSettings.backgroundType === 'gradient'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          Gradient
                        </button>
                        <button
                          onClick={() => {
                            const newSettings = { ...editorSettings, backgroundType: 'solid' };
                            handleSettingsChange(newSettings);
                          }}
                          className={`px-3 py-2 rounded-lg transition-all text-sm ${
                            editorSettings.backgroundType === 'solid'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          Solid
                        </button>
                        <button
                          onClick={() => {
                            const newSettings = { ...editorSettings, backgroundType: 'image' };
                            handleSettingsChange(newSettings);
                          }}
                          className={`px-3 py-2 rounded-lg transition-all text-sm ${
                            editorSettings.backgroundType === 'image'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          Image
                        </button>
                      </div>

                      {editorSettings.backgroundType === 'gradient' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-2">Color 1</label>
                            <input
                              type="color"
                              value={editorSettings.gradientColors[0]}
                              onChange={(e) => {
                                const newSettings = {
                                  ...editorSettings,
                                  gradientColors: [e.target.value, editorSettings.gradientColors[1]]
                                };
                                handleSettingsChange(newSettings);
                              }}
                              className="w-full h-12 rounded-lg cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Color 2</label>
                            <input
                              type="color"
                              value={editorSettings.gradientColors[1]}
                              onChange={(e) => {
                                const newSettings = {
                                  ...editorSettings,
                                  gradientColors: [editorSettings.gradientColors[0], e.target.value]
                                };
                                handleSettingsChange(newSettings);
                              }}
                              className="w-full h-12 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {editorSettings.backgroundType === 'solid' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Background Color</label>
                          <input
                            type="color"
                            value={editorSettings.solidColor}
                            onChange={(e) => {
                              const newSettings = { ...editorSettings, solidColor: e.target.value };
                              handleSettingsChange(newSettings);
                            }}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                        </div>
                      )}

                      {editorSettings.backgroundType === 'image' && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium mb-2">Background Image</label>

                          {editorSettings.backgroundImage ? (
                            <div className="space-y-3">
                              <div className="relative aspect-video rounded-lg overflow-hidden bg-black/20">
                                <img
                                  src={editorSettings.backgroundImage}
                                  alt="Background preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newSettings = {
                                    ...editorSettings,
                                    backgroundImage: null,
                                    backgroundImageId: null
                                  };
                                  handleSettingsChange(newSettings);
                                }}
                                className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-all"
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <label className="block cursor-pointer">
                              <div className="px-4 py-8 border-2 border-dashed border-white/20 rounded-lg hover:border-purple-500 hover:bg-white/5 transition-all text-center">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm font-medium mb-1">Upload Background Image</p>
                                <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  try {
                                    const formData = new FormData();
                                    formData.append('file', file);

                                    const response = await fetch('http://localhost:8000/api/upload-background', {
                                      method: 'POST',
                                      body: formData
                                    });

                                    const result = await response.json();
                                    if (result.success) {
                                      const newSettings = {
                                        ...editorSettings,
                                        backgroundImage: URL.createObjectURL(file),
                                        backgroundImageId: result.file_id
                                      };
                                      handleSettingsChange(newSettings);
                                    } else {
                                      alert('Failed to upload background image');
                                    }
                                  } catch (error) {
                                    console.error('Upload error:', error);
                                    alert('Failed to upload background image');
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeEditorSection === 'position' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Device Rotation</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Rotation: {editorSettings.rotation}°
                        </label>
                        <input
                          type="range"
                          min="-15"
                          max="15"
                          value={editorSettings.rotation}
                          onChange={(e) => {
                            const newSettings = { ...editorSettings, rotation: parseInt(e.target.value) };
                            handleSettingsChange(newSettings);
                          }}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>-15°</span>
                          <span>0°</span>
                          <span>15°</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Canvas */}
              <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col overflow-hidden">
                {editingTemplate && editingScreenshots.length > 0 ? (
                  <>
                    {/* Header with Project Name and Actions */}
                    <div className="mb-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Enter project name..."
                            className="flex-1 max-w-md px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <button
                            onClick={handleSaveProject}
                            disabled={savingProject || !projectName.trim()}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-semibold transition-all flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            {savingProject ? 'Saving...' : 'Save Project'}
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            setEditingTemplate(null);
                            setEditingScreenshots([]);
                            setCurrentScreenshotIndex(0);
                            setProjectName('');
                            setCurrentProject(null);
                            setActiveTab('preview');
                          }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all"
                        >
                          Back to Preview
                        </button>
                      </div>
                      <p className="text-sm text-gray-400">
                        Based on: {editingTemplate.name}
                      </p>
                    </div>

                    {/* All Screenshots Side by Side */}
                    <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                      {editingScreenshots.map((screenshot, idx) => (
                        <div
                          key={screenshot.preview_id}
                          className={`flex-shrink-0 w-64 flex flex-col ${
                            currentScreenshotIndex === idx ? 'ring-2 ring-purple-500 rounded-xl' : ''
                          }`}
                        >
                          <button
                            onClick={() => setCurrentScreenshotIndex(idx)}
                            className="relative aspect-[9/19.5] mb-3 rounded-xl overflow-hidden hover:scale-105 transition-transform"
                          >
                            <img
                              src={screenshot.preview || api.getDownloadUrl(screenshot.preview_id)}
                              alt={screenshot.caption}
                              className="w-full h-full object-cover"
                            />
                            {currentScreenshotIndex === idx && (
                              <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                Editing
                              </div>
                            )}
                            {dirtyScreenshots.has(idx) && (
                              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                Edited
                              </div>
                            )}
                          </button>
                          <p className="text-sm text-center text-gray-300 font-semibold px-2">
                            {screenshot.caption}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Submit Buttons at Bottom */}
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      {/* Apply to All Toggle */}
                      <label className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <input
                          type="checkbox"
                          checked={applyToAll}
                          onChange={(e) => setApplyToAll(e.target.checked)}
                          className="w-5 h-5 text-purple-600 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold">Apply changes to all screenshots</span>
                          <p className="text-xs text-gray-400 mt-0.5">
                            When enabled, background and rotation changes apply to all screenshots
                          </p>
                        </div>
                      </label>

                      {/* Generate All Captions Button */}
                      <button
                        onClick={async () => {
                          setGeneratingAllCaptions(true);
                          try {
                            const captionPromises = editingScreenshots.map(async (screenshot, idx) => {
                              try {
                                const result = await api.generateCaption(screenshot.preview_id);
                                return { idx, caption: result.caption };
                              } catch (error) {
                                console.error(`Failed to generate caption for screenshot ${idx}:`, error);
                                return { idx, caption: null };
                              }
                            });

                            const results = await Promise.all(captionPromises);

                            // Update all captions
                            const newEdits = { ...screenshotEdits };
                            const newDirty = new Set(dirtyScreenshots);

                            results.forEach(({ idx, caption }) => {
                              if (caption) {
                                const currentSettings = newEdits[idx] || editorSettings;
                                newEdits[idx] = { ...currentSettings, text: caption };
                                newDirty.add(idx);
                              }
                            });

                            setScreenshotEdits(newEdits);
                            setDirtyScreenshots(newDirty);

                            // Update current editor settings if we're viewing one of them
                            if (results[currentScreenshotIndex]?.caption) {
                              setEditorSettings(prev => ({
                                ...prev,
                                text: results[currentScreenshotIndex].caption
                              }));
                            }

                            const successCount = results.filter(r => r.caption !== null).length;
                            alert(`Generated ${successCount} out of ${editingScreenshots.length} captions!`);
                          } catch (error) {
                            console.error('Failed to generate all captions:', error);
                            alert('Failed to generate captions. Please try again.');
                          } finally {
                            setGeneratingAllCaptions(false);
                          }
                        }}
                        disabled={generatingAllCaptions}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Sparkles className="w-6 h-6" />
                        {generatingAllCaptions ? 'Generating All Captions...' : 'Generate All Captions with AI'}
                      </button>

                      {/* Regenerate Edited Button */}
                      {dirtyScreenshots.size > 0 && (
                        <button
                          onClick={handleGenerateEditedPreviews}
                          disabled={generatingEditedPreview}
                          className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          <Sparkles className="w-6 h-6" />
                          {generatingEditedPreview ? `Generating ${dirtyScreenshots.size} Edited...` : `Regenerate ${dirtyScreenshots.size} Edited Screenshot${dirtyScreenshots.size > 1 ? 's' : ''}`}
                        </button>
                      )}

                      {/* Generate All Button */}
                      <button
                        onClick={handleGenerateAllPreviews}
                        disabled={generatingEditedPreview}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Sparkles className="w-6 h-6" />
                        {generatingEditedPreview ? 'Generating All Screenshots...' : 'Generate All Previews'}
                      </button>

                      {/* Status Text */}
                      <p className="text-xs text-center text-gray-400">
                        {dirtyScreenshots.size > 0
                          ? `${dirtyScreenshots.size} screenshot${dirtyScreenshots.size > 1 ? 's' : ''} edited • ${editingScreenshots.length} total`
                          : `All ${editingScreenshots.length} screenshots with their individual settings`
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Select a template preview to start editing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h2 className="text-2xl font-bold mb-6">My Projects</h2>

                {savedProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 text-lg">No saved projects yet</p>
                    <p className="text-gray-500 text-sm mt-2">Create a project by editing a template and saving it</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProjects.map((project) => {
                      const template = TEMPLATES.find(t => t.backendTemplateId === project.template_id);

                      return (
                        <div
                          key={project.id}
                          className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500 transition-all"
                        >
                          {/* Project Preview */}
                          <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-4 flex items-center justify-center">
                            {project.screenshots && project.screenshots.length > 0 ? (
                              <div className="flex gap-2 overflow-hidden">
                                {project.screenshots.slice(0, 3).map((screenshot, idx) => (
                                  <div key={idx} className="w-16 flex-shrink-0">
                                    <img
                                      src={screenshot.preview || api.getDownloadUrl(screenshot.preview_id)}
                                      alt={`Screenshot ${idx + 1}`}
                                      className="w-full rounded-lg shadow-lg"
                                    />
                                  </div>
                                ))}
                                {project.screenshots.length > 3 && (
                                  <div className="w-16 flex-shrink-0 bg-white/10 rounded-lg flex items-center justify-center">
                                    <span className="text-xs font-semibold">+{project.screenshots.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Sparkles className="w-12 h-12 opacity-30" />
                            )}
                          </div>

                          {/* Project Info */}
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1 truncate">{project.name}</h3>
                            <p className="text-xs text-gray-400 mb-2">
                              Based on: {template?.name || 'Custom Upload'}
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              {project.screenshots?.length || 0} screenshots • Updated{' '}
                              {new Date(project.updated_at).toLocaleDateString()}
                            </p>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                              <button
                                onClick={() => {
                                  setViewingProjectPreview(project);
                                }}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                              >
                                <ImageIcon className="w-4 h-4" />
                                View Previews
                              </button>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    // Load project into editor
                                    // For uploaded screenshots without a template, create a custom template
                                    const loadedTemplate = template || {
                                      name: 'Custom Upload',
                                      settings: {
                                        deviceFrame: project.settings?.device || 'iphone-15-pro',
                                        textPosition: 'top',
                                        backgroundType: project.settings?.backgroundType || 'gradient',
                                        backgroundConfig: project.settings?.backgroundConfig || { colors: ['#667eea', '#764ba2'] },
                                        positioning: project.settings?.positioning || { rotation: 0 }
                                      },
                                      backendTemplateId: project.template_id
                                    };

                                    setEditingTemplate(loadedTemplate);
                                    setEditingScreenshots(project.screenshots || []);
                                    setCurrentScreenshotIndex(0);
                                    setProjectName(project.name);
                                    setCurrentProject(project);

                                    // Restore screenshot edits if available
                                    if (project.screenshot_edits) {
                                      setScreenshotEdits(project.screenshot_edits);
                                    } else {
                                      setScreenshotEdits({});
                                    }

                                    // Clear dirty state when loading a project
                                    setDirtyScreenshots(new Set());

                                    // Set editor settings from project
                                    if (project.settings) {
                                      setEditorSettings({
                                        device: project.settings.device || 'iphone-15-pro',
                                        text: project.screenshots?.[0]?.individual_settings?.text || project.screenshots?.[0]?.caption || '',
                                        textPosition: project.screenshots?.[0]?.individual_settings?.textPosition || 'top',
                                        textColor: project.screenshots?.[0]?.individual_settings?.textColor || 'white',
                                        backgroundType: project.settings.backgroundType || 'gradient',
                                        gradientColors: project.settings.backgroundConfig?.colors || ['#667eea', '#764ba2'],
                                        solidColor: project.settings.backgroundConfig?.color || '#ffffff',
                                        backgroundImage: null,
                                        backgroundImageId: null,
                                        rotation: project.settings.positioning?.rotation ?? 0
                                      });
                                    }

                                    setActiveTab('editor');
                                  }}
                                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    // TODO: Add download all functionality
                                    alert('Download all functionality coming soon!');
                                  }}
                                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload & Generate Tab */}
          {activeTab === 'upload' && (
            <div className="flex items-center justify-center min-h-[60vh]">
              {/* Upload Section */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 max-w-2xl w-full text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UploadIcon className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Upload Your Screenshots</h2>
                  <p className="text-gray-400">Upload your app screenshots and we'll take you to the editor to create beautiful previews</p>
                </div>
                <label className="block cursor-pointer">
                  <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg text-center transition-all transform hover:scale-105 shadow-lg">
                    {uploading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Uploading...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <ImageIcon className="w-6 h-6" />
                        Choose Screenshots to Upload
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-4">Supports PNG, JPG, JPEG • Multiple files allowed</p>
              </div>
            </div>
          )}

            {/* Old screenshots section - no longer needed */}
            {false && screenshots.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Screenshots & Captions</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateAllCaptions}
                      disabled={generatingAllCaptions}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      {generatingAllCaptions ? 'Generating All...' : 'Generate All Captions'}
                    </button>
                    <button
                      onClick={() => {
                        // Load screenshots into editor mode
                        const screenshotsForEditor = screenshots.map((screenshot, idx) => ({
                          screenshot_path: screenshot.path,
                          preview_id: screenshot.id,
                          caption: screenshot.textOverlay?.text || `Screenshot ${idx + 1}`,
                          preview: screenshot.preview
                        }));

                        setEditingScreenshots(screenshotsForEditor);
                        setCurrentScreenshotIndex(0);
                        setScreenshotEdits({});
                        setDirtyScreenshots(new Set());
                        setProjectName('My Project');

                        // Set initial template settings
                        setEditingTemplate({
                          name: 'Custom Upload',
                          settings: {
                            deviceFrame: 'iphone-15-pro',
                            textPosition: 'top',
                            backgroundType: 'gradient',
                            backgroundConfig: {
                              colors: ['#667eea', '#764ba2']
                            },
                            positioning: {
                              rotation: 0
                            }
                          },
                          backendTemplateId: null
                        });

                        setEditorSettings({
                          device: 'iphone-15-pro',
                          text: screenshotsForEditor[0]?.caption || '',
                          textPosition: 'top',
                          textColor: 'white',
                          backgroundType: 'gradient',
                          gradientColors: ['#667eea', '#764ba2'],
                          solidColor: '#ffffff',
                          backgroundImage: null,
                          backgroundImageId: null,
                          rotation: 0
                        });

                        setActiveTab('editor');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit & Generate Previews
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {screenshots.map((screenshot, index) => (
                    <div key={screenshot.id} className="flex gap-4 items-start bg-white/5 rounded-xl p-4">
                      <div className="w-24 flex-shrink-0">
                        <img
                          src={screenshot.preview}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full rounded-lg shadow-lg"
                        />
                        <p className="text-center text-xs text-gray-400 mt-1">#{index + 1}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">Caption</label>
                          <button
                            onClick={() => handleGenerateCaption(screenshot.id)}
                            disabled={generatingCaptions[screenshot.id]}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <Sparkles className="w-3 h-3" />
                            {generatingCaptions[screenshot.id] ? 'Generating...' : 'Generate Caption'}
                          </button>
                        </div>
                        <textarea
                          value={screenshot.textOverlay?.text || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              updateScreenshotText(screenshot.id, {
                                text: e.target.value,
                                position: screenshot.textOverlay?.position || 'top',
                                font_size: screenshot.textOverlay?.font_size || 80,
                                color: screenshot.textOverlay?.color || '#FFFFFF',
                              });
                            } else {
                              updateScreenshotText(screenshot.id, null);
                            }
                          }}
                          placeholder="e.g., 'Design your dream outfit in MINUTES!'"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                          rows="2"
                        />

                        {screenshot.textOverlay?.text && (
                          <div className="mt-3 flex gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Position</label>
                              <select
                                value={screenshot.textOverlay.position}
                                onChange={(e) =>
                                  updateScreenshotText(screenshot.id, {
                                    ...screenshot.textOverlay,
                                    position: e.target.value,
                                  })
                                }
                                className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs"
                              >
                                <option value="top">Top</option>
                                <option value="center">Center</option>
                                <option value="bottom">Bottom</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">
                                Size: {screenshot.textOverlay.font_size}px
                              </label>
                              <input
                                type="range"
                                min="40"
                                max="120"
                                value={screenshot.textOverlay.font_size}
                                onChange={(e) =>
                                  updateScreenshotText(screenshot.id, {
                                    ...screenshot.textOverlay,
                                    font_size: parseInt(e.target.value),
                                  })
                                }
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Color</label>
                              <input
                                type="color"
                                value={screenshot.textOverlay.color}
                                onChange={(e) =>
                                  updateScreenshotText(screenshot.id, {
                                    ...screenshot.textOverlay,
                                    color: e.target.value,
                                  })
                                }
                                className="w-12 h-8 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </main>

      {/* Remove old modals - no longer needed with sidebar */}
      {false && showTemplates && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/20 p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Choose a Template</h2>
                  <p className="text-gray-400 text-sm mt-1">Select a pre-designed template to get started quickly</p>
                </div>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`group relative bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all border-2 ${
                      selectedTemplate?.id === template.id
                        ? 'border-purple-500'
                        : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    {/* Template Preview */}
                    <div
                      className="w-full h-48 rounded-lg mb-3 flex items-center justify-center"
                      style={{ background: template.thumbnail }}
                    >
                      <div className="w-16 h-28 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-2xl" />
                    </div>

                    {/* Template Info */}
                    <div className="text-left">
                      <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                      <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                      <p className="text-xs text-purple-400 mb-3">{template.settings.captionStyle}</p>

                      {/* View Examples Button - For templates with examples */}
                      {template.hasExamples && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTemplateExamples(template.backendTemplateId || template.id);
                          }}
                          disabled={generatingTemplatePreviews[template.backendTemplateId || template.id]}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-semibold transition-all"
                        >
                          {generatingTemplatePreviews[template.backendTemplateId || template.id] ? 'Generating...' : 'View Examples'}
                        </button>
                      )}
                    </div>

                    {/* Selected Indicator */}
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Generated Previews Modal */}
      {viewingGeneratedPreviews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/20 p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Generated Previews</h2>
                <p className="text-gray-400 text-sm mt-1">Your app store preview screenshots are ready!</p>
              </div>
              <button
                onClick={() => setViewingGeneratedPreviews(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {editingScreenshots.map((screenshot, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="aspect-[9/19.5] mb-3 rounded-lg overflow-hidden bg-black/20">
                    <img
                      src={screenshot.preview || api.getDownloadUrl(screenshot.preview_id)}
                      alt={screenshot.caption}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-center text-gray-300 font-semibold mb-2">
                    {screenshot.caption}
                  </p>
                  <a
                    href={api.getDownloadUrl(screenshot.preview_id)}
                    download={`preview_${idx + 1}.png`}
                    className="block w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-semibold text-center transition-all"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-400">
                {editingScreenshots.length} screenshot{editingScreenshots.length > 1 ? 's' : ''} generated
              </p>
              <button
                onClick={() => setViewingGeneratedPreviews(false)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Preview Modal */}
      {viewingProjectPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/20 p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{viewingProjectPreview.name}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {viewingProjectPreview.screenshots?.length || 0} screenshots •
                  Updated {new Date(viewingProjectPreview.updated_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setViewingProjectPreview(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {viewingProjectPreview.screenshots?.map((screenshot, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="aspect-[9/19.5] mb-3 rounded-lg overflow-hidden bg-black/20">
                    <img
                      src={screenshot.preview || api.getDownloadUrl(screenshot.preview_id)}
                      alt={screenshot.caption || `Screenshot ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-center text-gray-300 font-semibold mb-2">
                    {screenshot.individual_settings?.text || screenshot.caption || `Screenshot ${idx + 1}`}
                  </p>
                  <a
                    href={api.getDownloadUrl(screenshot.preview_id)}
                    download={`${viewingProjectPreview.name}_${idx + 1}.png`}
                    className="block w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-semibold text-center transition-all"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-400">
                {viewingProjectPreview.screenshots?.length || 0} screenshot{(viewingProjectPreview.screenshots?.length || 0) > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewingProjectPreview(null);
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-semibold transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const project = viewingProjectPreview;
                    const template = TEMPLATES.find(t => t.backendTemplateId === project.template_id);
                    const loadedTemplate = template || {
                      name: 'Custom Upload',
                      settings: {
                        deviceFrame: project.settings?.device || 'iphone-15-pro',
                        textPosition: 'top',
                        backgroundType: project.settings?.backgroundType || 'gradient',
                        backgroundConfig: project.settings?.backgroundConfig || { colors: ['#667eea', '#764ba2'] },
                        positioning: project.settings?.positioning || { rotation: 0 }
                      },
                      backendTemplateId: project.template_id
                    };

                    setEditingTemplate(loadedTemplate);
                    setEditingScreenshots(project.screenshots || []);
                    setCurrentScreenshotIndex(0);
                    setProjectName(project.name);
                    setCurrentProject(project);

                    if (project.screenshot_edits) {
                      setScreenshotEdits(project.screenshot_edits);
                    } else {
                      setScreenshotEdits({});
                    }

                    setDirtyScreenshots(new Set());

                    if (project.settings) {
                      setEditorSettings({
                        device: project.settings.device || 'iphone-15-pro',
                        text: project.screenshots?.[0]?.individual_settings?.text || project.screenshots?.[0]?.caption || '',
                        textPosition: project.screenshots?.[0]?.individual_settings?.textPosition || 'top',
                        textColor: project.screenshots?.[0]?.individual_settings?.textColor || 'white',
                        backgroundType: project.settings.backgroundType || 'gradient',
                        gradientColors: project.settings.backgroundConfig?.colors || ['#667eea', '#764ba2'],
                        solidColor: project.settings.backgroundConfig?.color || '#ffffff',
                        backgroundImage: null,
                        backgroundImageId: null,
                        rotation: project.settings.positioning?.rotation ?? 0
                      });
                    }

                    setViewingProjectPreview(null);
                    setActiveTab('editor');
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
