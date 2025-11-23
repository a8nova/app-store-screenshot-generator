# Backend - App Store Preview Generator

Simple FastAPI backend that uses fal.ai FLUX models to generate app store previews.

## Structure

```
backend/
├── app.py              # Everything in one file!
├── requirements.txt    # Python dependencies
├── .env               # Your FAL_KEY goes here
└── user_data/         # All uploaded/generated files
    ├── uploads/       # User uploaded screenshots
    └── outputs/       # Generated previews
```

## Setup

1. **Install dependencies**
```bash
pip install -r requirements.txt
```

2. **Configure FAL_KEY**
```bash
# Edit .env and add your key
FAL_KEY=your_fal_api_key_here
```

Get your key from: https://fal.ai/dashboard/keys

3. **Run the server**
```bash
python app.py
```

Server runs on `http://localhost:8000`

## How It Works

1. User uploads screenshots → Saved to `user_data/uploads/`
2. User clicks generate → FLUX creates previews
3. Generated previews → Saved to `user_data/outputs/`
4. User downloads → Files served from `user_data/outputs/`

## FLUX Integration

All generation uses fal.ai FLUX models:
- **edit-image**: Composites screenshots with backgrounds, device frames, effects
- Supports hex color codes: `"color #667eea"`
- Prompt-based control for everything

## API Endpoints

- `POST /api/upload` - Upload screenshots
- `POST /api/generate` - Generate previews
- `GET /api/status/{job_id}` - Check job status
- `GET /api/download/{preview_id}` - Download preview
- `DELETE /api/cleanup/{job_id}` - Clean up files
