# 🔞 Stable Diffusion - NSFW Uncensored Edition

## 🎯 สำหรับสร้างภาพแบบไม่จำกัด (Personal Use Only)

---

## 📦 Uncensored Models ที่แนะนำ:

### **1. ChilloutMix** ⭐⭐⭐ แนะนำที่สุด
- **ประเภท:** Realistic, Asian-focused
- **ความเชี่ยวชาญ:** ภาพคนเอเชีย, NSFW content, photorealistic
- **ขนาด:** ~2GB
- **ดาวน์โหลด:** [Civitai](https://civitai.com/models/6424/chilloutmix)

**ตัวอย่าง Prompt:**
```
beautiful asian woman, nude, bedroom, professional photography,
soft lighting, photorealistic, detailed skin, 8k uhd
Negative: ugly, bad quality, blurry
```

---

### **2. Realistic Vision v6.0** ⭐⭐⭐
- **ประเภท:** Ultra Realistic
- **ความเชี่ยวชาญ:** ความสมจริงสูง, ผิวหนังละเอียด, NSFW-friendly
- **ขนาด:** ~2GB
- **ดาวน์โหลด:** [Civitai](https://civitai.com/models/4201/realistic-vision-v60-b1)

**ตัวอย่าง Prompt:**
```
RAW photo, beautiful woman, nude, natural lighting,
photorealistic, 8k uhd, high detail, dslr, film grain
Negative: cartoon, 3d, anime, painting, bad quality
```

---

### **3. DreamShaper 8** ⭐⭐
- **ประเภท:** All-Purpose, Versatile
- **ความเชี่ยวชาญ:** ครบจบทุกแนว, NSFW, Fantasy, Realistic
- **ขนาด:** ~2GB

**ตัวอย่าง Prompt:**
```
intimate scene, two people, bedroom, cinematic lighting,
photorealistic, romantic, detailed, 8k
Negative: bad quality, blurry, ugly
```

---

### **4. CyberRealistic v3.3** ⭐⭐
- **ประเภท:** Hyper Realistic
- **ความเชี่ยวชาญ:** ความสมจริงสูงสุด, lighting ดี
- **ขนาด:** ~2GB

---

## 🛠️ การใช้งานใน Colab:

### **Cell 2.0.1 - Download Models:**

```python
#@title ## 📦 Download NSFW Uncensored Models

#@markdown เลือก Model ที่ต้องการ (สามารถเลือกได้หลายตัว)

# NSFW-Friendly Models
ChilloutMix = True  #@param {type:"boolean"}
RealisticVision_v60 = True  #@param {type:"boolean"}
DreamShaper_8 = False  #@param {type:"boolean"}
CyberRealistic_v33 = False  #@param {type:"boolean"}

download_path = "/content/drive/MyDrive/SD-Model/Checkpoint/"

# ChilloutMix
if ChilloutMix:
    file_name = "chilloutmix_NiPrunedFp32Fix.safetensors"
    file_url = "https://civitai.com/api/download/models/11745"
    if not os.path.exists(os.path.join(download_path, file_name)):
        print(f"📥 กำลังดาวน์โหลด ChilloutMix...")
        !aria2c --console-log-level=error -c -x 16 -s 16 -k 1M {file_url} -d {download_path} -o {file_name}
        print("✅ ดาวน์โหลด ChilloutMix สำเร็จ!")
    else:
        print(f"✅ {file_name} มีอยู่แล้ว")

# Realistic Vision v6.0
if RealisticVision_v60:
    file_name = "realisticVisionV60B1_v60B1VAE.safetensors"
    file_url = "https://civitai.com/api/download/models/245598"
    if not os.path.exists(os.path.join(download_path, file_name)):
        print(f"📥 กำลังดาวน์โหลด Realistic Vision v6.0...")
        !aria2c --console-log-level=error -c -x 16 -s 16 -k 1M {file_url} -d {download_path} -o {file_name}
        print("✅ ดาวน์โหลด Realistic Vision v6.0 สำเร็จ!")
    else:
        print(f"✅ {file_name} มีอยู่แล้ว")

# DreamShaper 8
if DreamShaper_8:
    file_name = "dreamshaper_8.safetensors"
    file_url = "https://civitai.com/api/download/models/128713"
    if not os.path.exists(os.path.join(download_path, file_name)):
        print(f"📥 กำลังดาวน์โหลด DreamShaper 8...")
        !aria2c --console-log-level=error -c -x 16 -s 16 -k 1M {file_url} -d {download_path} -o {file_name}
        print("✅ ดาวน์โหลด DreamShaper 8 สำเร็จ!")
    else:
        print(f"✅ {file_name} มีอยู่แล้ว")

# CyberRealistic v3.3
if CyberRealistic_v33:
    file_name = "cyberrealistic_v33.safetensors"
    file_url = "https://civitai.com/api/download/models/138176"
    if not os.path.exists(os.path.join(download_path, file_name)):
        print(f"📥 กำลังดาวน์โหลด CyberRealistic v3.3...")
        !aria2c --console-log-level=error -c -x 16 -s 16 -k 1M {file_url} -d {download_path} -o {file_name}
        print("✅ ดาวน์โหลด CyberRealistic v3.3 สำเร็จ!")
    else:
        print(f"✅ {file_name} มีอยู่แล้ว")

print("\n" + "="*70)
print("✅ ดาวน์โหลด Models เรียบร้อย!")
print("="*70)
```

---

## 🎨 Prompt Guidelines สำหรับ NSFW:

### **Artistic Nude:**
```
Positive:
"beautiful woman, artistic nude, professional photography,
soft lighting, elegant pose, photorealistic, detailed skin, 8k uhd"

Negative:
"ugly, bad anatomy, bad hands, bad quality, blurry, low resolution"
```

### **Realistic Portrait:**
```
Positive:
"RAW photo, beautiful asian woman, nude, natural lighting,
bedroom, photorealistic, detailed face, detailed skin, 8k uhd, dslr"

Negative:
"cartoon, 3d, anime, painting, ugly, bad quality, blurry"
```

### **Intimate Scene:**
```
Positive:
"intimate romantic scene, two people, bedroom, cinematic lighting,
photorealistic, passionate, detailed, 8k uhd"

Negative:
"ugly, bad anatomy, bad quality, blurry, cartoon, low resolution"
```

### **Explicit Content:**
```
Positive:
"explicit content, sexual activity, bedroom scene,
photorealistic, cinematic lighting, high detail, 8k uhd"

Negative:
"ugly, bad anatomy, deformed, bad quality, blurry"
```

---

## ⚙️ การตั้งค่าที่แนะนำ:

### **สำหรับ ChilloutMix:**
```
Steps: 25-30
Sampler: DPM++ 2M Karras
CFG Scale: 7-8
Size: 512x768 หรือ 768x512
```

### **สำหรับ Realistic Vision:**
```
Steps: 20-30
Sampler: DPM++ SDE Karras
CFG Scale: 6-7
Size: 512x768 หรือ 768x512
```

### **สำหรับ DreamShaper:**
```
Steps: 20-25
Sampler: Euler a
CFG Scale: 7-9
Size: 512x512 หรือ 512x768
```

---

## 🎯 Tips สำหรับภาพ NSFW คุณภาพสูง:

### 1. **ใช้ Negative Prompt ที่ดี**
```
ugly, bad anatomy, bad hands, bad feet, bad fingers,
bad proportions, deformed, disfigured, malformed,
mutated, extra limbs, missing limbs, blurry, low quality,
low resolution, watermark, signature, text
```

### 2. **เพิ่ม Detail**
```
Positive Prompt เพิ่ม:
- "detailed skin texture"
- "detailed face"
- "8k uhd"
- "high resolution"
- "photorealistic"
- "professional photography"
```

### 3. **ควบคุม Lighting**
```
- "soft lighting" = แสงนุ่ม สบายตา
- "cinematic lighting" = แสงแบบหนัง
- "natural lighting" = แสงธรรมชาติ
- "studio lighting" = แสงสตูดิโอ
- "golden hour" = แสงพระอาทิตย์ตก
```

### 4. **ใช้ Aspect Ratio ที่เหมาะสม**
```
Portrait (คน): 512x768, 576x768, 768x1024
Landscape (ฉาก): 768x512, 1024x576
Square: 512x512, 768x768
```

### 5. **เพิ่มความหลากหลาย**
```
- เปลี่ยน Seed ทุกครั้ง (seed: -1)
- ปรับ CFG Scale (6-9)
- ลอง Sampler ต่างๆ
```

---

## 🔧 Troubleshooting:

### ❌ "ภาพออกมาไม่ NSFW"
**แก้:**
- ตรวจสอบว่าใช้ Uncensored Model (ChilloutMix, Realistic Vision)
- ลบคำว่า "nsfw, nude, naked" ออกจาก Negative Prompt
- เพิ่มความชัดเจนใน Positive Prompt

### ❌ "Anatomy ผิดเพี้ยน (มือ/เท้า/นิ้ว)"
**แก้:**
- เพิ่ม Negative: "bad hands, bad fingers, bad anatomy"
- ลด CFG Scale ลงเหลือ 6-7
- เพิ่ม Steps เป็น 30-35
- ใช้ Inpainting แก้ไขส่วนที่ผิด

### ❌ "ภาพมัว/คุณภาพต่ำ"
**แก้:**
- เพิ่ม "8k uhd, high resolution, detailed"
- เพิ่ม Negative: "blurry, low resolution, low quality"
- เพิ่ม Steps
- ใช้ Hires Fix (ถ้ามี)

---

## 📊 เปรียบเทียบ Models:

| Model | Realistic | Asian | Speed | NSFW | ใช้งานง่าย |
|-------|-----------|-------|-------|------|-----------|
| ChilloutMix | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Realistic Vision | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| DreamShaper | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| CyberRealistic | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎓 ตัวอย่าง Prompts พร้อมใช้งาน:

### **Artistic Nude Portrait:**
```
Prompt:
beautiful woman, artistic nude, professional photography,
soft lighting, elegant pose, detailed face, detailed skin,
photorealistic, 8k uhd, high quality

Negative:
ugly, bad anatomy, bad hands, bad quality, blurry,
low resolution, cartoon, 3d, anime

Settings:
Steps: 28
CFG: 7
Sampler: DPM++ 2M Karras
Size: 512x768
```

### **Intimate Bedroom Scene:**
```
Prompt:
intimate romantic scene, beautiful couple, bedroom,
cinematic lighting, photorealistic, passionate, sensual,
detailed skin, 8k uhd, professional photography

Negative:
ugly, bad anatomy, bad proportions, bad quality, blurry,
cartoon, low resolution

Settings:
Steps: 30
CFG: 7.5
Sampler: DPM++ SDE Karras
Size: 768x512
```

### **Explicit Content:**
```
Prompt:
explicit sexual content, photorealistic, bedroom scene,
detailed anatomy, cinematic lighting, high detail, 8k uhd,
professional photography, detailed skin texture

Negative:
ugly, bad anatomy, deformed, bad quality, blurry,
cartoon, 3d, low resolution

Settings:
Steps: 30-35
CFG: 7
Sampler: DPM++ 2M Karras
Size: 768x512 หรือ 512x768
```

---

สร้างเมื่อ: 2025-01-08
เวอร์ชัน: 1.0.0 - Uncensored Edition
สำหรับ: การใช้งานส่วนตัวเท่านั้น
