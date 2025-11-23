# App Store Preview Generator 🎨

An elegant web application for generating stunning app store preview images powered by FLUX AI models from fal.ai.

## Features

✨ **AI-Powered Generation** - Uses fal.ai's alpha-image-232 models for text-to-image and image editing

📱 **Device Frames** - Add realistic iPhone, Android, or iPad frames to your screenshots

🎨 **Advanced Backgrounds**
- Solid colors
- Beautiful gradients with presets
- Custom background images (upload your own)
- AI-generated backgrounds with custom prompts

⚙️ **Advanced Controls**
- Scale and rotation adjustments
- Precise positioning (horizontal and vertical offsets)
- Shadow and reflection effects
- Text overlays with customizable fonts and colors

📦 **Batch Processing** - Upload and process multiple screenshots at once

🎯 **Template System** - Pre-designed templates with professional layouts

💾 **Project Management** - Save and load your projects with per-screenshot settings

⚡ **Parallel Generation** - All screenshots generate simultaneously for faster processing

🔄 **Selective Regeneration** - Regenerate only edited screenshots or all at once

💾 **Multiple Export Formats**
- App Store (1290x2796)
- Play Store (1080x1920)
- iPad (2048x2732)

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Dropzone** - File upload
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Python 3.9+**
- **FastAPI** - Web framework
- **fal-client** - fal.ai API integration
- **Pillow (PIL)** - Image processing
- **Uvicorn** - ASGI server

## Setup & Installation

### Prerequisites
- Node.js 22+ and npm
- Python 3.9+
- fal.ai API key ([Get one here](https://fal.ai/dashboard/keys))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
cp .env.example .env
```

5. Add your fal.ai API key to the `.env` file:
```
FAL_KEY=your_fal_api_key_here
```

6. Start the backend server:
```bash
python app.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Quick Start with Templates

1. **Browse Templates** - Click the "Templates" tab to see pre-designed professional layouts
2. **Select a Template** - Click on any template preview to load it into the editor
3. **Customize** - Edit text, colors, device frames, and rotation for each screenshot
4. **Generate** - Click "Regenerate X Edited Screenshot(s)" for selective updates or "Generate All Previews" for batch processing
5. **Save Project** - Save your work to continue editing later

### Custom Screenshots

1. **Upload Screenshots** - Drag and drop or click to upload one or more app screenshots
2. **Customize Per Screenshot**:
   - Device frame type (iPhone 15 Pro, iPhone 14, iPhone 13)
   - Background: Solid color, Gradient, or Custom image
   - Text overlay with position (top/center/bottom)
   - Device rotation (-15° to +15°)
3. **Apply to All Toggle** - Enable to apply background/rotation changes to all screenshots at once
4. **Generate Previews** - All screenshots process in parallel for maximum speed
5. **Download** - Download individual previews or save as a project

## API Endpoints

### `POST /api/upload`
Upload screenshots for processing

### `POST /api/upload-background`
Upload custom background images

### `POST /api/edit-preview`
Generate/edit a single preview with custom settings (supports parallel processing)

### `POST /api/generate-template-preview`
Generate previews from a template

### `GET /api/download/{preview_id}`
Download a generated preview image

### `POST /api/save-project`
Save a project with all settings

### `GET /api/projects`
Get all saved projects

### `GET /api/project/{project_id}`
Get a specific project

### `POST /api/generate-caption/{screenshot_id}`
Generate AI caption for a screenshot using vision AI

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  - UploadZone: File upload and gallery           │  │
│  │  - ControlsPanel: Advanced settings controls      │  │
│  │  - PreviewResults: Generated previews display     │  │
│  │  - Zustand Store: Global state management         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ REST API
┌─────────────────────────────────────────────────────────┐
│                  Python FastAPI Backend                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  - main.py: API routes and endpoints              │  │
│  │  - fal_service.py: fal.ai integration             │  │
│  │  - image_processor.py: Image manipulation         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## fal.ai Models Used

### alpha-image-232/text-to-image
Used for generating AI backgrounds based on text prompts

### alpha-image-232/edit-image
Used for image editing and enhancement capabilities

## Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
source venv/bin/activate
python app.py
```

The backend runs with hot-reload enabled for development.

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

### Backend
For production, use a production ASGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## License

MIT

## Credits

- Powered by [fal.ai](https://fal.ai) FLUX models
- Built with React, FastAPI, and Tailwind CSS
