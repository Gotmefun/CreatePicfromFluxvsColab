#!/usr/bin/env python3
"""
API Server สำหรับเชื่อมต่อ Stable Diffusion WebUI กับเว็บไซต์
ใช้ร่วมกับ ZenityX Colab Notebook

วิธีใช้งาน:
1. รัน Stable Diffusion WebUI ใน Colab (ตาม notebook เดิม)
2. รัน script นี้ใน cell ใหม่
3. เอา URL ที่ได้ไปใส่ใน Settings > Colab API Endpoint ของเว็บไซต์
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import io
import json
from PIL import Image

app = Flask(__name__)
CORS(app)  # อนุญาตให้เว็บไซต์เรียก API ข้าม domain ได้

# URL ของ Stable Diffusion WebUI API (รันอยู่ภายใน Colab)
SD_WEBUI_URL = "http://127.0.0.1:7860"

@app.route('/health', methods=['GET'])
def health_check():
    """ตรวจสอบว่า API Server และ SD WebUI ทำงานปกติหรือไม่"""
    try:
        # ลองเรียก SD WebUI API
        response = requests.get(f"{SD_WEBUI_URL}/sdapi/v1/options", timeout=5)
        if response.status_code == 200:
            return jsonify({
                "status": "healthy",
                "sd_webui": "connected",
                "message": "API Server และ SD WebUI พร้อมใช้งาน"
            })
        else:
            return jsonify({
                "status": "degraded",
                "sd_webui": "error",
                "message": "SD WebUI ไม่ตอบสนอง"
            }), 500
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "sd_webui": "disconnected",
            "error": str(e),
            "message": "ไม่สามารถเชื่อมต่อกับ SD WebUI ได้"
        }), 500

@app.route('/models', methods=['GET'])
def get_models():
    """ดึงรายการ models ที่มีใน SD WebUI"""
    try:
        response = requests.get(f"{SD_WEBUI_URL}/sdapi/v1/sd-models")
        if response.status_code == 200:
            models = response.json()
            return jsonify({
                "success": True,
                "models": [model["title"] for model in models]
            })
        else:
            return jsonify({
                "success": False,
                "error": "ไม่สามารถดึงรายการ models ได้"
            }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/generate', methods=['POST'])
def generate_image():
    """
    สร้างรูปภาพด้วย Stable Diffusion

    Request Body:
    {
        "prompt": "คำอธิบายภาพ",
        "negative_prompt": "สิ่งที่ไม่ต้องการ",
        "steps": 20,
        "guidance_scale": 7.5,
        "width": 512,
        "height": 512,
        "seed": -1  # -1 = random
    }
    """
    try:
        data = request.json

        # ดึงพารามิเตอร์จาก request
        prompt = data.get('prompt', '')
        negative_prompt = data.get('negative_prompt', '')
        steps = data.get('steps', 20)
        cfg_scale = data.get('guidance_scale', 7.5)
        width = data.get('width', 512)
        height = data.get('height', 512)
        seed = data.get('seed', -1)

        if not prompt:
            return jsonify({
                "success": False,
                "error": "กรุณาใส่ prompt"
            }), 400

        print(f"🎨 กำลังสร้างรูป: {prompt[:50]}...")

        # เตรียม payload สำหรับ SD WebUI API
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "steps": steps,
            "cfg_scale": cfg_scale,
            "width": width,
            "height": height,
            "seed": seed,
            "sampler_name": "DPM++ 2M Karras",
            "sampler_index": "DPM++ 2M Karras",
            "batch_size": 1,
            "n_iter": 1,
            "save_images": True,
            "send_images": True,
            "do_not_save_samples": False,
            "do_not_save_grid": False,
        }

        # เรียก SD WebUI API
        print("📡 กำลังเรียก SD WebUI API...")
        response = requests.post(
            f"{SD_WEBUI_URL}/sdapi/v1/txt2img",
            json=payload,
            timeout=300  # timeout 5 นาที
        )

        if response.status_code != 200:
            return jsonify({
                "success": False,
                "error": f"SD WebUI API error: {response.status_code}"
            }), 500

        result = response.json()

        # ดึงรูปภาพที่สร้างได้ (base64)
        if 'images' in result and len(result['images']) > 0:
            image_base64 = result['images'][0]

            # แปลงเป็น data URL สำหรับส่งกลับไปยังเว็บ
            image_data_url = f"data:image/png;base64,{image_base64}"

            print("✅ สร้างรูปสำเร็จ!")

            return jsonify({
                "success": True,
                "image": image_data_url,
                "info": result.get('info', {}),
                "parameters": {
                    "prompt": prompt,
                    "negative_prompt": negative_prompt,
                    "steps": steps,
                    "cfg_scale": cfg_scale,
                    "width": width,
                    "height": height,
                    "seed": result.get('parameters', {}).get('seed', seed)
                }
            })
        else:
            return jsonify({
                "success": False,
                "error": "ไม่พบรูปภาพที่สร้างได้"
            }), 500

    except requests.Timeout:
        return jsonify({
            "success": False,
            "error": "การสร้างรูปใช้เวลานานเกินไป กรุณาลองใหม่"
        }), 504
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/img2img', methods=['POST'])
def img2img():
    """
    แปลงรูปภาพด้วย img2img

    Request Body:
    {
        "prompt": "คำอธิบายภาพ",
        "negative_prompt": "สิ่งที่ไม่ต้องการ",
        "init_image": "data:image/png;base64,...",
        "denoising_strength": 0.7,
        "steps": 20,
        "guidance_scale": 7.5,
        "width": 512,
        "height": 512
    }
    """
    try:
        data = request.json

        prompt = data.get('prompt', '')
        negative_prompt = data.get('negative_prompt', '')
        init_image = data.get('init_image', '')
        denoising_strength = data.get('denoising_strength', 0.7)
        steps = data.get('steps', 20)
        cfg_scale = data.get('guidance_scale', 7.5)
        width = data.get('width', 512)
        height = data.get('height', 512)

        if not prompt or not init_image:
            return jsonify({
                "success": False,
                "error": "กรุณาใส่ prompt และรูปภาพต้นฉบับ"
            }), 400

        # ตัด data URL header ออก (data:image/png;base64,)
        if ',' in init_image:
            init_image = init_image.split(',')[1]

        print(f"🎨 กำลังแปลงรูป: {prompt[:50]}...")

        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "init_images": [init_image],
            "denoising_strength": denoising_strength,
            "steps": steps,
            "cfg_scale": cfg_scale,
            "width": width,
            "height": height,
            "sampler_name": "DPM++ 2M Karras",
            "batch_size": 1,
            "n_iter": 1,
        }

        response = requests.post(
            f"{SD_WEBUI_URL}/sdapi/v1/img2img",
            json=payload,
            timeout=300
        )

        if response.status_code != 200:
            return jsonify({
                "success": False,
                "error": f"SD WebUI API error: {response.status_code}"
            }), 500

        result = response.json()

        if 'images' in result and len(result['images']) > 0:
            image_base64 = result['images'][0]
            image_data_url = f"data:image/png;base64,{image_base64}"

            print("✅ แปลงรูปสำเร็จ!")

            return jsonify({
                "success": True,
                "image": image_data_url,
                "info": result.get('info', {}),
            })
        else:
            return jsonify({
                "success": False,
                "error": "ไม่พบรูปภาพที่สร้างได้"
            }), 500

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    """หน้าแรก - แสดงข้อมูล API"""
    return jsonify({
        "name": "Colab SD WebUI API Server",
        "version": "1.0.0",
        "endpoints": {
            "health": "GET /health - ตรวจสอบสถานะ",
            "models": "GET /models - ดูรายการ models",
            "generate": "POST /generate - สร้างรูปจาก prompt",
            "img2img": "POST /img2img - แปลงรูปภาพ"
        },
        "status": "running"
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Colab SD WebUI API Server...")
    print("=" * 60)
    print(f"📡 SD WebUI URL: {SD_WEBUI_URL}")
    print("🌐 API Server will run on: http://0.0.0.0:8000")
    print("=" * 60)
    print("\n⚠️  สำคัญ! อย่าลืม:")
    print("1. เปิด Stable Diffusion WebUI ก่อน (รัน cell 1.0.1)")
    print("2. รอให้ WebUI โหลดเสร็จ (เห็น URL สีเขียว)")
    print("3. คัดลอก Cloudflare URL ที่ได้จาก terminal ไปใส่ในเว็บไซต์")
    print("=" * 60)

    # รัน Flask server
    app.run(host='0.0.0.0', port=8000, debug=False)
