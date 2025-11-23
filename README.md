# App Store Preview Generator 🎨

An elegant web application for generating stunning app store preview images powered by FLUX from fal.ai.

## Features


📱 **Device Frames** - Add realistic iPhone, Android, or iPad frames to your screenshots

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

