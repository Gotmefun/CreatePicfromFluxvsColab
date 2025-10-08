# 🚀 คู่มือการเชื่อมต่อ Colab กับเว็บไซต์ AI Gen

## 📋 สิ่งที่ต้องเตรียม

1. ✅ Google Colab Notebook (ZenityX_SD_Webui_Colab_V3.ipynb)
2. ✅ เว็บไซต์ https://aigen.ptee88.com/
3. ✅ ไฟล์ API Server (`api/colab_api_server.py`)

---

## 📦 ขั้นตอนที่ 1: เตรียม Colab Notebook

### 1.1 เพิ่ม Cell ใหม่ใน Colab

เปิด `ZenityX_SD_Webui_Colab_V3.ipynb` และเพิ่ม **Cell ใหม่** ต่อจาก Cell 1.0.1 (หลังจากที่ WebUI รันเสร็จแล้ว):

```python
#@title ## 1.0.3 🌐 Start API Server (รันหลังจาก WebUI เปิดแล้ว)
#@markdown รัน Cell นี้เพื่อเปิด API Server สำหรับเชื่อมต่อกับเว็บไซต์

# ติดตั้ง dependencies
!pip install -q flask flask-cors

# อัพโหลดไฟล์ API Server
from google.colab import files
import os

# สร้างโฟลเดอร์ api
!mkdir -p /content/api

# ดาวน์โหลดไฟล์ API Server จาก GitHub หรือ Google Drive
# วิธีที่ 1: จาก Google Drive (แนะนำ)
# อัพโหลด colab_api_server.py ไว้ใน Google Drive ที่ /content/drive/MyDrive/SD-Model/
!cp /content/drive/MyDrive/SD-Model/colab_api_server.py /content/api/

# วิธีที่ 2: อัพโหลดด้วยมือ (ถ้าไม่มีใน Drive)
# uploaded = files.upload()
# !mv colab_api_server.py /content/api/

# รัน API Server
%cd /content/api
!python colab_api_server.py &

# รอให้ API Server เริ่มทำงาน
import time
time.sleep(5)

# ติดตั้ง pyngrok เพื่อสร้าง Public URL
!pip install -q pyngrok

# สร้าง ngrok tunnel
from pyngrok import ngrok
import os

# ตั้งค่า ngrok (ใส่ token ของคุณที่ https://dashboard.ngrok.com/get-started/your-authtoken)
# ngrok.set_auth_token("YOUR_NGROK_TOKEN_HERE")  # แก้ไขตรงนี้!

# สร้าง public URL
public_url = ngrok.connect(8000)
print("=" * 70)
print("✅ API Server พร้อมใช้งานแล้ว!")
print("=" * 70)
print(f"🌐 Public URL: {public_url}")
print("=" * 70)
print("\n📝 คัดลอก URL ด้านบนไปใส่ใน Settings > Google Colab > API Endpoint")
print("=" * 70)
```

### 1.2 วิธีใช้งานแบบไม่ต้องใช้ ngrok (ใช้ Cloudflare Tunnel)

```python
#@title ## 1.0.3 🌐 Start API Server with Cloudflare (ไม่ต้องสมัคร ngrok)

# ติดตั้ง dependencies
!pip install -q flask flask-cors

# สร้างโฟลเดอร์และคัดลอกไฟล์
!mkdir -p /content/api
!cp /content/drive/MyDrive/SD-Model/colab_api_server.py /content/api/

# รัน API Server ใน background
import subprocess
import time
import threading

def run_api_server():
    subprocess.run(["python", "/content/api/colab_api_server.py"])

# เริ่ม API Server ใน thread แยก
server_thread = threading.Thread(target=run_api_server, daemon=True)
server_thread.start()

print("⏳ รอ API Server เริ่มทำงาน...")
time.sleep(5)

# ใช้ Cloudflare Tunnel (มีติดตั้งอยู่แล้วจาก extension)
print("=" * 70)
print("✅ API Server กำลังทำงาน!")
print("=" * 70)
print("🔗 URL สำหรับเชื่อมต่อ:")
print("   http://127.0.0.1:8000 (ใช้ใน Colab)")
print("=" * 70)
print("\n📝 หากต้องการเชื่อมต่อจากภายนอก:")
print("   1. ใช้ Cloudflare URL จาก tunnels extension")
print("   2. หรือติดตั้ง ngrok (ดูวิธีด้านบน)")
print("=" * 70)

# ทดสอบ API
import requests
try:
    response = requests.get("http://127.0.0.1:8000/health", timeout=5)
    if response.status_code == 200:
        print("\n✅ API Server ทำงานปกติ!")
        print(response.json())
except Exception as e:
    print(f"\n❌ Error: {e}")
```

---

## 📦 ขั้นตอนที่ 2: อัพโหลดไฟล์ API Server ไปยัง Google Drive

1. เปิด Google Drive
2. ไปที่โฟลเดอร์ `SD-Model`
3. อัพโหลดไฟล์ `colab_api_server.py` จากเครื่องของคุณ (`E:\My App\Ai Gen Pic Flux AiwithColab\api\colab_api_server.py`)

---

## 📦 ขั้นตอนที่ 3: รัน Colab Notebook

### 3.1 รันตามลำดับ

1. รัน Cell **1.0.1** - เปิด Stable Diffusion WebUI
2. รอจนกว่า WebUI จะโหลดเสร็จ (เห็น URL สีเขียว 3 ลิงก์)
3. รัน Cell **1.0.3** - เปิด API Server
4. คัดลอก Public URL ที่ได้

### 3.2 ตัวอย่าง URL ที่ได้

```
https://xxxx-xx-xxx-xxx-xxx.ngrok-free.app
```

หรือ

```
https://xxxxx.trycloudflare.com
```

---

## 📦 ขั้นตอนที่ 4: ตั้งค่าเว็บไซต์

1. เปิด https://aigen.ptee88.com/
2. ไปที่ **Settings** (⚙️)
3. เลื่อนลงมาที่ **Google Colab Settings**
4. ใส่ URL ที่คัดลอกไว้ลงใน **API Endpoint**
5. กด **Save Settings**

---

## ✅ ขั้นตอนที่ 5: ทดสอบการใช้งาน

1. ไปที่หน้า **AI Generation**
2. ใส่ Prompt เช่น: `beautiful woman, professional photo`
3. กด **Generate**
4. รอสักครู่ (ประมาณ 30-60 วินาที)
5. จะเห็นรูปที่สร้างได้!

---

## 🔧 Troubleshooting

### ❌ "กรุณาตั้งค่า API Endpoint"
- ไปที่ Settings > Google Colab
- ตรวจสอบว่าใส่ URL ถูกต้อง
- URL ต้องขึ้นต้นด้วย `https://`

### ❌ "API Error: 500"
- ตรวจสอบว่า WebUI รันอยู่หรือไม่ (กลับไปดู Colab)
- ลอง Refresh หน้า Colab
- รัน Cell 1.0.2 เพื่อ restart WebUI

### ❌ "Connection Timeout"
- ตรวจสอบว่า API Server รันอยู่หรือไม่
- ลองรัน Cell 1.0.3 ใหม่
- ตรวจสอบว่า ngrok token ถูกต้อง

### ❌ ngrok Error: "authentication failed"
- ไปที่ https://dashboard.ngrok.com/get-started/your-authtoken
- คัดลอก token
- ใส่ใน Cell 1.0.3 บรรทัด `ngrok.set_auth_token("YOUR_TOKEN")`

---

## 📊 API Endpoints

### `GET /health`
ตรวจสอบสถานะ API

```bash
curl https://your-url.ngrok.io/health
```

### `GET /models`
ดูรายการ models ที่มี

```bash
curl https://your-url.ngrok.io/models
```

### `POST /generate`
สร้างรูปภาพ

```bash
curl -X POST https://your-url.ngrok.io/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "beautiful landscape",
    "steps": 20,
    "width": 512,
    "height": 512
  }'
```

---

## 💡 Tips

1. **ประหยัดเวลา**: เซฟไฟล์ `colab_api_server.py` ไว้ใน Google Drive เพื่อไม่ต้องอัพโหลดใหม่ทุกครั้ง
2. **ngrok Free**: ใช้ได้ฟรี แต่ URL จะเปลี่ยนทุกครั้งที่รัน (ต้องอัพเดต Settings ใหม่)
3. **ngrok Paid**: URL ไม่เปลี่ยน ตั้งค่าครั้งเดียวใช้ได้เรื่อยๆ
4. **Colab Runtime**: จำกัดเวลา อย่าลืมปิดเมื่อใช้งานเสร็จ

---

## 🎯 ขั้นตอนสรุป (Quick Start)

```
1. อัพโหลด colab_api_server.py ไปยัง Google Drive/SD-Model/
2. เปิด Colab → รัน Cell 1.0.1 (WebUI)
3. รอ WebUI โหลดเสร็จ
4. รัน Cell 1.0.3 (API Server)
5. คัดลอก URL ที่ได้
6. ไปที่เว็บ Settings → ใส่ URL → Save
7. ไปที่ AI Generation → ทดสอบสร้างรูป
```

---

## 📞 ติดต่อสอบถาม

หากมีปัญหาหรือข้อสงสัย สามารถสอบถามได้ที่:
- Facebook: [ZenityX AI Studio](https://www.facebook.com/zenityXAiStudio)

---

สร้างเมื่อ: 2025-01-08
เวอร์ชัน: 1.0.0
