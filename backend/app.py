from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path
import fal_client
import requests
from dotenv import load_dotenv
import time
import random

load_dotenv()

app = FastAPI(title="App Store Preview Generator")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single user_data folder for everything
USER_DATA_DIR = Path("user_data")
UPLOAD_DIR = USER_DATA_DIR / "uploads"
OUTPUT_DIR = USER_DATA_DIR / "outputs"
PROJECTS_DIR = USER_DATA_DIR / "projects"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)

# In-memory job storage
jobs_db: Dict[str, Dict[str, Any]] = {}

# fal.ai API key
FAL_KEY = os.getenv("FAL_KEY")
if not FAL_KEY:
    print("⚠️  Warning: FAL_KEY not found in .env file")


class Screenshot(BaseModel):
    id: str
    textOverlay: Optional[Dict[str, Any]] = None

class GenerationRequest(BaseModel):
    screenshots: List[Screenshot]  # Each screenshot with its own text
    device_frame: Optional[str] = "iphone-15-pro"
    background_type: str = "gradient"
    background_config: Dict[str, Any] = {}
    positioning: Dict[str, Any] = {
        "scale": 0.85,
        "rotation": 0,
        "x_offset": 0,
        "y_offset": 0,
        "shadow": True,
        "reflection": False
    }
    output_size: str = "app-store"


@app.get("/")
async def root():
    return {
        "message": "App Store Preview Generator API",
        "status": "running",
        "fal_key_configured": bool(FAL_KEY)
    }


@app.post("/api/upload")
async def upload_screenshots(files: List[UploadFile] = File(...)):
    """Upload screenshots"""
    uploaded_files = []

    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"{file.filename} is not an image")

        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        file_path = UPLOAD_DIR / f"{file_id}{file_extension}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        uploaded_files.append({
            "id": file_id,
            "filename": file.filename,
            "path": str(file_path),
            "size": file_path.stat().st_size
        })

    return {"success": True, "files": uploaded_files, "count": len(uploaded_files)}


@app.post("/api/upload-background")
async def upload_background(file: UploadFile = File(...)):
    """Upload background image"""
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"{file.filename} is not an image")

        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        file_path = UPLOAD_DIR / f"bg_{file_id}{file_extension}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "path": str(file_path),
            "size": file_path.stat().st_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate")
async def generate_previews(request: GenerationRequest, background_tasks: BackgroundTasks):
    """Generate previews using FLUX"""
    job_id = str(uuid.uuid4())

    jobs_db[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "progress": 0,
        "total_screenshots": len(request.screenshots),
        "completed_screenshots": 0,
        "results": [],
        "created_at": datetime.now().isoformat(),
        "error": None
    }

    background_tasks.add_task(process_job, job_id, request)

    return {
        "success": True,
        "job_id": job_id,
        "message": f"Started generation for {len(request.screenshots)} screenshot(s)"
    }


@app.get("/api/status/{job_id}")
async def get_job_status(job_id: str):
    """Get job status"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs_db[job_id]


@app.get("/api/download/{preview_id}")
async def download_preview(preview_id: str):
    """Download generated preview"""
    file_path = OUTPUT_DIR / f"{preview_id}.png"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preview not found")
    return FileResponse(file_path, media_type="image/png", filename=f"preview_{preview_id}.png")


@app.post("/api/edit-preview/{preview_id}")
async def edit_preview(preview_id: str, text_overlay: Dict[str, Any]):
    """Re-edit a generated preview with new caption"""
    try:
        # Find the generated preview file
        preview_path = OUTPUT_DIR / f"{preview_id}.png"
        if not preview_path.exists():
            raise HTTPException(status_code=404, detail="Preview not found")

        # Upload preview to fal.ai
        image_url = fal_client.upload_file(str(preview_path))

        # Build prompt with just the text overlay changes
        prompt_parts = []
        if text_overlay and text_overlay.get("text"):
            text = text_overlay["text"]
            position = text_overlay.get("position", "top")
            prompt_parts.append(f'text overlay "{text}" positioned at the {position}')
            prompt_parts.append("professional, clean, modern app store aesthetic, high quality")
            prompt = ", ".join(prompt_parts)
        else:
            raise HTTPException(status_code=400, detail="No text overlay provided")

        # Get output size (use app-store default)
        size = (1290, 2796)

        print(f"🎨 Re-editing preview with prompt: {prompt}")

        # Generate seed for consistency
        seed = int(preview_id.replace("-", "")[:8], 16) % (2**32)

        # Call FLUX edit-image API
        result = fal_client.subscribe(
            "fal-ai/alpha-image-232/edit-image",
            arguments={
                "prompt": prompt,
                "image_urls": [image_url],
                "strength": 0.65,
                "guidance_scale": 3.5,
                "num_inference_steps": 28,
                "seed": seed,
                "image_size": {"width": size[0], "height": size[1]},
                "enable_safety_checker": True,
            },
        )

        # Download and save result (overwrite original)
        if result and "images" in result and len(result["images"]) > 0:
            generated_url = result["images"][0]["url"]
            response = requests.get(generated_url)
            with open(preview_path, "wb") as f:
                f.write(response.content)

            return {
                "success": True,
                "preview_id": preview_id,
                "download_url": f"/api/download/{preview_id}"
            }
        else:
            raise Exception("No image generated by FLUX")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class TemplatePreviewRequest(BaseModel):
    template_id: int

@app.post("/api/generate-template-preview")
async def generate_template_preview(request: TemplatePreviewRequest):
    """Generate preview screenshots for a template using actual screenshots"""
    try:
        template_id = request.template_id

        # Template source screenshots mapping (relative to project root)
        project_root = Path(__file__).parent.parent
        template_screenshots = {
            2: [
                project_root / "templates/weatherapp/IMG_5497-min.PNG",
                project_root / "templates/weatherapp/IMG_5498-min.PNG",
                project_root / "templates/weatherapp/IMG_5499-min.PNG",
                project_root / "templates/weatherapp/IMG_5500-min.PNG",
                project_root / "templates/weatherapp/IMG_5501.PNG"
            ],
            3: [
                project_root / "templates/healthapp/IMG_5504-min.PNG",
                project_root / "templates/healthapp/IMG_5505-min.PNG",
                project_root / "templates/healthapp/IMG_5506-min.PNG",
                project_root / "templates/healthapp/IMG_5507-min.PNG",
                project_root / "templates/healthapp/IMG_5508-min.PNG"
            ],
            4: [
                project_root / "templates/homeapp/IMG_5515-min.PNG",
                project_root / "templates/homeapp/IMG_5516-min.PNG",
                project_root / "templates/homeapp/IMG_5517-min.PNG",
                project_root / "templates/homeapp/IMG_5518-min.PNG",
                project_root / "templates/homeapp/IMG_5519-min.PNG"
            ],
            5: [
                project_root / "templates/phillzcoffe/IMG_5520-min.PNG",
                project_root / "templates/phillzcoffe/IMG_5521-min.PNG",
                project_root / "templates/phillzcoffe/IMG_5522-min.PNG",
                project_root / "templates/phillzcoffe/IMG_5523-min.PNG",
                project_root / "templates/phillzcoffe/IMG_5524-min.PNG"
            ],
            6: [
                project_root / "templates/roku/IMG_5525-min.PNG",
                project_root / "templates/roku/IMG_5526-min.PNG",
                project_root / "templates/roku/IMG_5527-min.PNG",
                project_root / "templates/roku/IMG_5528-min.PNG",
                project_root / "templates/roku/IMG_5529-min.PNG"
            ],
            7: [
                project_root / "templates/newsapp/IMG_5531-min.PNG",
                project_root / "templates/newsapp/IMG_5532-min.PNG",
                project_root / "templates/newsapp/IMG_5533-min.PNG",
                project_root / "templates/newsapp/IMG_5534-min.PNG",
                project_root / "templates/newsapp/IMG_5535-min.PNG"
            ]
        }

        template_captions = {
            1: ["The app for FITNESS!", "1M+ happy USERS!", "Reduce stress with simple CHARTS!", "Your new program is WAITING!", "Track progress in REAL-TIME!"],
            2: ["Weather that's always ACCURATE!", "Track conditions across CITIES!", "Customize settings your WAY!", "See precipitation in REAL-TIME!", "Detailed forecasts at a GLANCE!"],
            3: ["Track your health GOALS!", "Achieve wellness SUCCESS!", "Monitor vitals DAILY!", "Your fitness journey STARTS here!", "Stay healthy and STRONG!"],
            4: ["Control your home with EASE!", "Smart living starts HERE!", "Automate everything EFFORTLESSLY!", "Your comfort is PRIORITY!", "Home automation made SIMPLE!"],
            5: ["Your daily coffee FIX!", "Order ahead and SKIP the line!", "Discover new FLAVORS!", "Personalize every SIP!", "Coffee made YOUR way!"],
            6: ["Stream UNLIMITED entertainment!", "Thousands of channels at your FINGERTIPS!", "Watch what YOU love!", "Your streaming hub AWAITS!", "Entertainment made SIMPLE!"],
            7: ["Stay INFORMED!", "Breaking news at your FINGERTIPS!", "Personalized STORIES!", "Never miss a HEADLINE!", "News that MATTERS!"]
        }

        template_settings = {
            1: {"device_frame": "iphone-15-pro", "background_type": "gradient", "background_config": {"colors": ["#667eea", "#764ba2"]}, "positioning": {"scale": 0.85, "rotation": 0, "x_offset": 0, "y_offset": 0, "shadow": True, "reflection": False}},
            2: {"device_frame": "iphone-15-pro", "background_type": "gradient", "background_config": {"colors": ["#4A90E2", "#50C9E8"]}, "positioning": {"scale": 0.85, "rotation": -2, "x_offset": 0, "y_offset": 0, "shadow": True, "reflection": False}},
            3: {"device_frame": "iphone-15-pro", "background_type": "gradient", "background_config": {"colors": ["#DC143C", "#000000"]}, "positioning": {"scale": 0.85, "rotation": 2, "x_offset": 0, "y_offset": 0, "shadow": True, "reflection": False}},
            4: {"device_frame": "iphone-15-pro", "background_type": "gradient", "background_config": {"colors": ["#FFFACD", "#FFFFFF"]}, "positioning": {"scale": 0.85, "rotation": 0, "x_offset": 0, "y_offset": 0, "shadow": True, "reflection": False}},
            5: {"device_frame": "iphone-15-pro", "background_type": "gradient", "background_config": {"colors": ["#8B4513", "#D2691E"]}, "positioning": {"scale": 0.85, "rotation": 0, "x_offset": 0, "y_offset": 0, "shadow": True, "reflection": False}},
            6: {"device_frame": "iphone-15-pro", "background_type": "gradient", "background_config": {"colors": ["#6A1B9A", "#9C27B0"]}, "positioning": {"scale": 0.85, "rotation": 0, "x_offset": 0, "y_offset": 0, "shadow": True, "reflection": False}},
            7: {"device_frame": "iphone-15-pro", "background_type": "gradient", "background_config": {"colors": ["#FF6B6B", "#FFE66D"]}, "positioning": {"scale": 0.85, "rotation": 10, "x_offset": 0, "y_offset": 0, "shadow": True, "reflection": False}}
        }

        if template_id not in template_captions:
            raise HTTPException(status_code=404, detail="Template not found")

        captions = template_captions[template_id]
        settings = template_settings[template_id]
        colors = settings["background_config"]["colors"]
        rotation = settings["positioning"]["rotation"]

        # Generate 5 preview screenshots using actual source screenshots
        results = []
        for idx, caption in enumerate(captions):
            preview_id = f"template_{template_id}_preview_{idx}"
            output_path = OUTPUT_DIR / f"{preview_id}.png"

            # Skip if already generated
            if output_path.exists():
                screenshot_path = template_screenshots.get(template_id, [None] * 5)[idx]
                results.append({
                    "preview_id": preview_id,
                    "caption": caption,
                    "download_url": f"/api/download/{preview_id}",
                    "screenshot_path": str(screenshot_path) if screenshot_path else None
                })
                continue

            # For templates 2 and 3, use actual screenshots
            if template_id in template_screenshots:
                screenshot_path = template_screenshots[template_id][idx]

                # Upload screenshot to fal.ai
                image_url = fal_client.upload_file(str(screenshot_path))
                print(f"📤 Uploaded screenshot: {screenshot_path.name}")

                # Build prompt using saved template structure
                # Use black text for template 4 (home app), white text for others
                text_color = "black" if template_id == 4 else "white"
                # Use bottom text for template 7 (news app), top for others
                text_position = "at the bottom" if template_id == 7 else "at the top"
                prompt = f"Professional app store preview screenshot with smooth gradient background from {colors[0]} to {colors[1]}. Center the app screenshot in a realistic iPhone 15 Pro mockup with device frame, slightly tilted {rotation} degrees, with elegant drop shadow. Add large bold {text_color} text overlay {text_position} reading \"{caption}\" with subtle shadow for depth. Clean modern app store marketing aesthetic, professional composition."

                print(f"🎨 Generating template {template_id} preview {idx + 1}: {caption}")

                # Use alpha-image-232/edit-image to composite screenshot
                result = fal_client.subscribe(
                    "fal-ai/alpha-image-232/edit-image",
                    arguments={
                        "prompt": prompt,
                        "image_urls": [image_url],
                        "strength": 0.65,
                        "guidance_scale": 3.5,
                        "num_inference_steps": 28,
                        "seed": 12345 + idx,
                        "image_size": {"width": 1290, "height": 2796},
                        "enable_safety_checker": True,
                    },
                )
            else:
                # Fallback to text-to-image for other templates
                prompt = f"Professional app store preview with gradient {colors[0]} to {colors[1]}, iPhone mockup, text \"{caption}\""
                result = fal_client.subscribe(
                    "fal-ai/flux/schnell",
                    arguments={
                        "prompt": prompt,
                        "image_size": {"width": 1290, "height": 2796},
                        "num_inference_steps": 4,
                        "seed": 12345 + idx,
                        "enable_safety_checker": True,
                    },
                )

            # Download and save result
            if result and "images" in result and len(result["images"]) > 0:
                generated_url = result["images"][0]["url"]
                response = requests.get(generated_url)
                with open(output_path, "wb") as f:
                    f.write(response.content)

                results.append({
                    "preview_id": preview_id,
                    "caption": caption,
                    "download_url": f"/api/download/{preview_id}",
                    "screenshot_path": str(screenshot_path) if 'screenshot_path' in locals() else None
                })
            else:
                raise Exception(f"Failed to generate preview {idx + 1}")

        return {
            "success": True,
            "template_id": template_id,
            "previews": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class EditPreviewRequest(BaseModel):
    screenshot_path: str
    caption: str
    text_position: str
    device_frame: str
    background_type: str
    background_config: dict
    positioning: dict
    background_image_id: Optional[str] = None


def generate_preview_sync(request: EditPreviewRequest, preview_id: str, output_path: Path, screenshot_file: Path):
    """Synchronous function to generate preview - runs in thread pool"""
    try:
        # Upload screenshot to fal.ai
        image_url = fal_client.upload_file(str(screenshot_file))
        print(f"📤 Uploaded screenshot for editing: {screenshot_file.name}")

        # Build prompt based on settings
        rotation = request.positioning.get("rotation", 0)

        # Handle background image if provided
        image_urls = [image_url]
        if request.background_type == "image" and request.background_image_id:
            # Find and upload background image
            bg_file = None
            for ext in [".png", ".jpg", ".jpeg", ".webp"]:
                bg_path = UPLOAD_DIR / f"bg_{request.background_image_id}{ext}"
                if bg_path.exists():
                    bg_file = bg_path
                    break

            if bg_file:
                bg_image_url = fal_client.upload_file(str(bg_file))
                # Use explicit image indexing: image 1 = background, image 2 = screenshot
                image_urls = [bg_image_url, image_url]
                print(f"📤 Uploaded background image: {bg_file.name}")
                text_color = "white"  # Default for custom backgrounds
                # Use explicit image indexing as per FLUX capabilities
                prompt = f"Use image 1 as the background. Place the app screenshot from image 2 in a realistic {request.device_frame} mockup with device frame, centered on the background, slightly tilted {rotation} degrees, with elegant drop shadow. Add large bold {text_color} text overlay at the {request.text_position} reading \"{request.caption}\" with subtle shadow for depth. Professional app store marketing aesthetic, clean composition."
            else:
                print(f"⚠️  Background image not found, falling back to gradient")
                request.background_type = "gradient"

        # Build prompt for gradient/solid backgrounds
        if request.background_type != "image":
            colors = request.background_config.get("colors", ["#667eea", "#764ba2"])

            # Determine text color based on background
            if colors[0] in ["#FFFACD", "#FFFFFF"] or colors[1] in ["#FFFACD", "#FFFFFF"]:
                text_color = "black"
            else:
                text_color = "white"

            # Use text position from request
            text_position_str = "at the bottom" if request.text_position == "bottom" else "at the top"

            if request.background_type == "gradient":
                prompt = f"Professional app store preview screenshot with smooth gradient background from {colors[0]} to {colors[1]}. Center the app screenshot in a realistic {request.device_frame} mockup with device frame, slightly tilted {rotation} degrees, with elegant drop shadow. Add large bold {text_color} text overlay {text_position_str} reading \"{request.caption}\" with subtle shadow for depth. Clean modern app store marketing aesthetic, professional composition."
            else:  # solid
                color = request.background_config.get("color", colors[0])
                prompt = f"Professional app store preview screenshot with solid {color} background. Center the app screenshot in a realistic {request.device_frame} mockup with device frame, slightly tilted {rotation} degrees, with elegant drop shadow. Add large bold {text_color} text overlay {text_position_str} reading \"{request.caption}\" with subtle shadow for depth. Clean modern app store marketing aesthetic, professional composition."

        print(f"🎨 Generating edited preview with caption: {request.caption}")
        print(f"🖼️  Background type: {request.background_type}")

        # Use alpha-image-232/edit-image to composite screenshot
        # image_urls now contains either [screenshot] or [background, screenshot]
        result = fal_client.subscribe(
            "fal-ai/alpha-image-232/edit-image",
            arguments={
                "prompt": prompt,
                "image_urls": image_urls,
                "strength": 0.65,
                "guidance_scale": 3.5,
                "num_inference_steps": 28,
                "seed": random.randint(1000, 9999),
                "image_size": {"width": 1290, "height": 2796},
                "enable_safety_checker": True,
            },
        )

        # Download and save result
        if result and "images" in result and len(result["images"]) > 0:
            generated_url = result["images"][0]["url"]
            response = requests.get(generated_url)
            with open(output_path, "wb") as f:
                f.write(response.content)

            print(f"✅ Edited preview saved: {preview_id}")
            return {
                "success": True,
                "preview_id": preview_id,
                "download_url": f"/api/download/{preview_id}"
            }
        else:
            raise Exception("Failed to generate edited preview")

    except Exception as e:
        print(f"❌ Error editing preview: {str(e)}")
        raise e


@app.post("/api/edit-preview")
async def edit_preview_new(request: EditPreviewRequest):
    """Edit a template preview with new settings and regenerate using FLUX"""
    try:
        # Generate unique preview ID with random component to avoid collisions
        timestamp = int(time.time() * 1000)
        random_suffix = random.randint(1000, 9999)
        preview_id = f"edited_preview_{timestamp}_{random_suffix}"
        output_path = OUTPUT_DIR / f"{preview_id}.png"

        # Parse screenshot path to get the actual file
        project_root = Path(__file__).parent.parent
        screenshot_file = Path(request.screenshot_path)
        if not screenshot_file.is_absolute():
            screenshot_file = project_root / request.screenshot_path

        if not screenshot_file.exists():
            raise HTTPException(status_code=404, detail=f"Screenshot not found: {screenshot_file}")

        # Run the blocking fal_client call in thread pool to avoid blocking event loop
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            executor,
            generate_preview_sync,
            request,
            preview_id,
            output_path,
            screenshot_file
        )

        return result

    except Exception as e:
        print(f"❌ Error editing preview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-caption/{screenshot_id}")
async def generate_caption(screenshot_id: str):
    """Generate AI caption for a screenshot using vision AI"""
    try:
        # Find screenshot file
        screenshot_path = None
        for ext in [".png", ".jpg", ".jpeg", ".webp"]:
            path = UPLOAD_DIR / f"{screenshot_id}{ext}"
            if path.exists():
                screenshot_path = path
                break

        if not screenshot_path:
            raise HTTPException(status_code=404, detail="Screenshot not found")

        # Upload to fal.ai
        image_url = fal_client.upload_file(str(screenshot_path))

        # Use fal.ai's vision model to analyze and generate caption
        # Using LLaVA or similar vision-language model available on fal.ai
        try:
            result = fal_client.subscribe(
                "fal-ai/llava-next",
                arguments={
                    "image_url": image_url,
                    "prompt": "Analyze this app screenshot and create a short, exciting marketing caption (5-8 words) that highlights the main feature or benefit. Format: Start with an action verb, describe the benefit, and END with 1-2 words in ALL CAPS for emphasis. Example: 'Design your dream outfit in MINUTES!' or 'Track your progress in REAL-TIME!' Only return the caption text, nothing else.",
                    "max_tokens": 30,
                },
            )

            if result and "output" in result:
                caption = result["output"].strip().strip('"').strip("'")

                # Ensure the caption follows the format (capitalize last 1-2 words if not already)
                words = caption.split()
                if len(words) >= 2:
                    # Capitalize last word if it's not already uppercase and seems like emphasis
                    if not words[-1].isupper() and len(words[-1]) > 2:
                        words[-1] = words[-1].upper()
                    caption = " ".join(words)

                # Clean up if it's too long
                if len(caption) > 80:
                    caption = caption[:77] + "..."
            else:
                # Fallback caption
                caption = "Transform your experience TODAY!"

        except Exception as e:
            print(f"Vision model error: {e}, using fallback")
            # Smart fallback captions with emphasis on last word (ASO optimized)
            captions = [
                "Design your dream in MINUTES!",
                "Create stunning content in SECONDS!",
                "Transform your workflow with EASE!",
                "Boost productivity by 10X!",
                "Unlock unlimited POSSIBILITIES!",
                "Build amazing projects FASTER!",
                "Experience the power of AUTOMATION!",
                "Organize everything in ONE PLACE!",
                "Collaborate with your team INSTANTLY!",
                "Track your progress in REAL-TIME!",
                "Simplify complex tasks with AI!",
                "Master new skills EFFORTLESSLY!",
                "Connect with millions WORLDWIDE!",
                "Achieve your goals FASTER!",
                "Save hours every WEEK!",
                "Get instant results with PRECISION!",
                "Work smarter, not HARDER!",
                "Unleash your creative GENIUS!",
                "Scale your business with CONFIDENCE!",
                "Make data-driven decisions INSTANTLY!"
            ]
            import random
            caption = random.choice(captions)

        return {
            "success": True,
            "caption": caption,
            "position": "top",
            "font_size": 80,
            "color": "#FFFFFF"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/templates/{template_id}")
async def get_template_info(template_id: int):
    """Get template configuration including prompt structure"""
    template_captions = {
        1: ["The app for FITNESS!", "1M+ happy USERS!", "Reduce stress with simple CHARTS!", "Your new program is WAITING!", "Track progress in REAL-TIME!"],
        2: ["Weather that's always ACCURATE!", "Track conditions across CITIES!", "Customize settings your WAY!", "See precipitation in REAL-TIME!", "Detailed forecasts at a GLANCE!"]
    }

    template_settings = {
        1: {"device_frame": "iphone-15-pro", "background_type": "gradient", "background_config": {"colors": ["#667eea", "#764ba2"]}, "positioning": {"scale": 0.85, "rotation": 0, "x_offset": 0, "y_offset": 0, "shadow": True, "reflection": False}},
        2: {"device_frame": "iphone-15-pro", "background_type": "gradient", "background_config": {"colors": ["#4A90E2", "#50C9E8"]}, "positioning": {"scale": 0.85, "rotation": -2, "x_offset": 0, "y_offset": 0, "shadow": True, "reflection": False}}
    }

    if template_id not in template_captions:
        raise HTTPException(status_code=404, detail="Template not found")

    return {
        "template_id": template_id,
        "captions": template_captions[template_id],
        "settings": template_settings[template_id],
        "prompt_config": TEMPLATE_PROMPTS.get(template_id, None)
    }

@app.delete("/api/cleanup/{job_id}")
async def cleanup_job(job_id: str):
    """Clean up job data"""
    if job_id in jobs_db:
        job = jobs_db[job_id]
        for result in job.get("results", []):
            if "path" in result:
                try:
                    Path(result["path"]).unlink(missing_ok=True)
                except:
                    pass
        del jobs_db[job_id]
        return {"success": True}
    raise HTTPException(status_code=404, detail="Job not found")


import asyncio
from concurrent.futures import ThreadPoolExecutor

# Thread pool for running blocking fal_client calls concurrently
executor = ThreadPoolExecutor(max_workers=10)

def process_screenshot_sync(job_id: str, idx: int, screenshot, request: GenerationRequest):
    """Synchronous function to process a single screenshot - runs in thread pool"""
    try:
        screenshot_id = screenshot.id
        text_overlay = screenshot.textOverlay

        # Find screenshot file
        screenshot_path = None
        for ext in [".png", ".jpg", ".jpeg", ".webp"]:
            path = UPLOAD_DIR / f"{screenshot_id}{ext}"
            if path.exists():
                screenshot_path = path
                break

        if not screenshot_path:
            raise FileNotFoundError(f"Screenshot {screenshot_id} not found")

        # Generate preview using FLUX
        preview_id = str(uuid.uuid4())
        output_path = OUTPUT_DIR / f"{preview_id}.png"

        # Build FLUX prompt with per-screenshot text
        prompt = build_flux_prompt(request, text_overlay)
        size = get_output_size(request.output_size)

        print(f"🎨 FLUX Prompt for screenshot {idx + 1}: {prompt}")

        # Upload image to fal.ai storage and get URL
        image_url = fal_client.upload_file(str(screenshot_path))

        print(f"📤 Uploaded to: {image_url}")

        # Use consistent seed for reproducible results
        # Generate seed from job_id for consistency across the job
        seed = int(job_id.replace("-", "")[:8], 16) % (2**32)

        # Call FLUX edit-image API with proper URL and seed
        result = fal_client.subscribe(
            "fal-ai/alpha-image-232/edit-image",
            arguments={
                "prompt": prompt,
                "image_urls": [image_url],  # Expects a list!
                "strength": 0.65,
                "guidance_scale": 3.5,
                "num_inference_steps": 28,
                "seed": seed + idx,  # Unique but deterministic seed per screenshot
                "image_size": {"width": size[0], "height": size[1]},
                "enable_safety_checker": True,
            },
        )

        # Download and save result
        if result and "images" in result and len(result["images"]) > 0:
            generated_url = result["images"][0]["url"]
            response = requests.get(generated_url)
            with open(output_path, "wb") as f:
                f.write(response.content)

            result_data = {
                "preview_id": preview_id,
                "screenshot_id": screenshot_id,
                "path": str(output_path),
                "download_url": f"/api/download/{preview_id}"
            }

            # Update progress atomically
            jobs_db[job_id]["completed_screenshots"] = idx + 1
            jobs_db[job_id]["progress"] = int((idx + 1) / len(request.screenshots) * 100)

            return result_data
        else:
            raise Exception("No image generated by FLUX")

    except Exception as e:
        print(f"❌ Error processing screenshot {idx + 1}: {e}")
        return {"screenshot_id": screenshot_id, "error": str(e)}

async def process_job(job_id: str, request: GenerationRequest):
    """Process generation job using FLUX - with TRUE concurrent processing"""
    try:
        jobs_db[job_id]["status"] = "processing"

        # Create tasks that run in thread pool for true parallelism
        loop = asyncio.get_event_loop()
        tasks = [
            loop.run_in_executor(
                executor,
                process_screenshot_sync,
                job_id,
                idx,
                screenshot,
                request
            )
            for idx, screenshot in enumerate(request.screenshots)
        ]

        # Run all screenshot processing concurrently
        print(f"🚀 Starting concurrent processing of {len(tasks)} screenshots...")
        results = await asyncio.gather(*tasks, return_exceptions=False)
        print(f"✅ Completed processing {len(results)} screenshots")

        # Mark complete
        jobs_db[job_id]["status"] = "completed"
        jobs_db[job_id]["progress"] = 100
        jobs_db[job_id]["results"] = results
        jobs_db[job_id]["completed_at"] = datetime.now().isoformat()

    except Exception as e:
        jobs_db[job_id]["status"] = "failed"
        jobs_db[job_id]["error"] = str(e)


# Template-specific prompt configurations for generating previews from user screenshots
TEMPLATE_PROMPTS = {
    2: {
        "base_prompt": "Professional app store preview screenshot with smooth gradient background from {color_start} to {color_end}. Center the app screenshot in a realistic iPhone 15 Pro mockup with device frame, slightly tilted {rotation} degrees, with elegant drop shadow. {text_overlay}Clean modern app store marketing aesthetic, professional composition.",
        "text_overlay_format": 'Add large bold white text overlay at the top reading "{text}" with subtle shadow for depth. '
    }
}

def build_flux_prompt(request: GenerationRequest, text_overlay: Optional[Dict[str, Any]] = None) -> str:
    """Build FLUX prompt from settings and per-screenshot text"""
    parts = []

    # Background
    if request.background_type == "ai-generated":
        bg_prompt = request.background_config.get("prompt", "modern gradient background")
        parts.append(f"App store preview with {bg_prompt}")
    elif request.background_type == "gradient":
        colors = request.background_config.get("colors", ["#667eea", "#764ba2"])
        parts.append(f"App store preview with smooth gradient background starting with color {colors[0]} and finishing with color {colors[1]}")
    elif request.background_type == "solid":
        color = request.background_config.get("color", "#667eea")
        parts.append(f"App store preview with solid background with color {color}")
    else:
        parts.append("App store preview with smooth gradient background starting with color #667eea and finishing with color #764ba2")

    # Device frame
    if request.device_frame and request.device_frame != "none":
        device_map = {
            "iphone-15-pro": "iPhone 15 Pro",
            "iphone-15": "iPhone 15",
            "android": "modern Android phone",
            "ipad": "iPad Pro"
        }
        device = device_map.get(request.device_frame, "smartphone")
        parts.append(f"app screenshot in realistic {device} device frame")
    else:
        parts.append("app screenshot centered")

    # Positioning
    scale = request.positioning.get("scale", 0.85)
    if scale != 1.0:
        size_descriptor = "large" if scale > 0.85 else "small" if scale < 0.75 else "medium"
        parts.append(f"{size_descriptor} sized device")

    x_offset = request.positioning.get("x_offset", 0)
    y_offset = request.positioning.get("y_offset", 0)
    if x_offset != 0 or y_offset != 0:
        position_desc = []
        if x_offset > 30:
            position_desc.append("shifted right")
        elif x_offset < -30:
            position_desc.append("shifted left")
        if y_offset > 30:
            position_desc.append("positioned lower")
        elif y_offset < -30:
            position_desc.append("positioned higher")
        if position_desc:
            parts.append(", ".join(position_desc))

    rotation = request.positioning.get("rotation", 0)
    if rotation != 0:
        parts.append(f"rotated {rotation} degrees")

    # Effects
    if request.positioning.get("shadow", True):
        parts.append("elegant drop shadow")
    if request.positioning.get("reflection", False):
        parts.append("subtle reflection")

    # Text overlay (per screenshot)
    if text_overlay and text_overlay.get("text"):
        text = text_overlay["text"]
        position = text_overlay.get("position", "bottom")
        parts.append(f'text overlay "{text}" positioned at the {position}')

    # Quality
    parts.append("professional, clean, modern app store aesthetic, high quality")

    return ", ".join(parts)


def get_output_size(size_preset: str) -> tuple:
    """Get output dimensions"""
    sizes = {
        "app-store": (1290, 2796),
        "play-store": (1080, 1920),
        "ipad": (2048, 2732),
    }
    return sizes.get(size_preset, (1290, 2796))


class SaveProjectRequest(BaseModel):
    project_id: Optional[str]
    name: str
    template_id: int
    screenshots: list
    settings: dict


@app.post("/api/save-project")
async def save_project(request: SaveProjectRequest):
    """Save edited template as a project"""
    try:
        import json

        # Generate project ID if new
        project_id = request.project_id or f"project_{int(time.time() * 1000)}"
        project_dir = PROJECTS_DIR / project_id
        project_dir.mkdir(exist_ok=True)

        # Save project metadata
        project_data = {
            "id": project_id,
            "name": request.name,
            "template_id": request.template_id,
            "screenshots": request.screenshots,
            "settings": request.settings,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        with open(project_dir / "project.json", "w") as f:
            json.dump(project_data, f, indent=2)

        return {
            "success": True,
            "project": project_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects")
async def get_projects():
    """Get all saved projects"""
    try:
        import json

        projects = []
        for project_dir in PROJECTS_DIR.iterdir():
            if project_dir.is_dir():
                project_file = project_dir / "project.json"
                if project_file.exists():
                    with open(project_file, "r") as f:
                        project_data = json.load(f)
                        projects.append(project_data)

        # Sort by updated_at descending
        projects.sort(key=lambda x: x.get("updated_at", ""), reverse=True)

        return {
            "success": True,
            "projects": projects
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/project/{project_id}")
async def get_project(project_id: str):
    """Get a specific project"""
    try:
        import json

        project_dir = PROJECTS_DIR / project_id
        project_file = project_dir / "project.json"

        if not project_file.exists():
            raise HTTPException(status_code=404, detail="Project not found")

        with open(project_file, "r") as f:
            project_data = json.load(f)

        return {
            "success": True,
            "project": project_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting App Store Preview Generator API...")
    print(f"📁 User data directory: {USER_DATA_DIR.absolute()}")
    print(f"🔑 FAL_KEY configured: {bool(FAL_KEY)}")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
