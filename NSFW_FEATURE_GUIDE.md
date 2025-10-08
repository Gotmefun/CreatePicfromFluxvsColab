# 🔞 คู่มือการใช้งาน NSFW Feature

## ✅ ฟีเจอร์ที่เพิ่มเข้ามา

### 1. **NSFW Toggle Switch** (Settings)
- ตั้งค่าเปิด/ปิดโหมด NSFW
- อยู่ที่: Settings > ทั่วไป > Enable NSFW Mode (18+)

### 2. **NSFW Prompt Templates** (AI Generation)
- 5 Templates สำเร็จรูป:
  - Artistic Nude
  - Intimate Scene
  - Sensual Portrait
  - Realistic Nude
  - Explicit Content

### 3. **Auto Negative Prompt**
- ถ้า **ปิด** NSFW Mode = ใส่ "nsfw, nude, naked, explicit..." อัตโนมัติ
- ถ้า **เปิด** NSFW Mode = ไม่ใส่ blocking keywords

### 4. **Uncensored Models สำหรับ Colab**
- ChilloutMix (Asian, Realistic, NSFW)
- Realistic Vision v6.0
- DreamShaper 8
- CyberRealistic v3.3

---

## 🚀 วิธีใช้งาน

### ขั้นตอนที่ 1: ตั้งค่า Colab

1. **เปิด Colab Notebook:**
   - `ZenityX_SD_Webui_Colab_V3.ipynb`

2. **เพิ่ม Cell ใหม่:**
   - คัดลอกโค้ดจาก `COLAB_CELL_NSFW_MODELS.txt`
   - เพิ่มหลัง Cell 2.0.1
   - เป็น Cell 2.0.2

3. **เลือก Model ที่ต้องการ:**
   ```python
   ChilloutMix = True  # แนะนำสำหรับคนเอเชีย
   RealisticVision_v60 = False
   DreamShaper_8 = False
   CyberRealistic_v33 = False
   ```

4. **รัน Cell 2.0.2:**
   - รอดาวน์โหลด Model (~2GB)
   - จะบันทึกลง Google Drive

5. **รัน Cell 1.0.1:**
   - เริ่ม Stable Diffusion WebUI
   - เลือก Model: ChilloutMix
   - รอจนขึ้น URL

6. **คัดลอก URL:**
   - คัดลอก Cloudflare/ngrok URL

---

### ขั้นตอนที่ 2: ตั้งค่าเว็บไซต์

1. **เปิดเว็บไซต์:**
   - https://aigen.ptee88.com/

2. **ไปที่ Settings:**
   - คลิก Settings (⚙️)

3. **เปิด NSFW Mode:**
   - เลื่อนลงมาที่ "Enable NSFW Mode (18+)"
   - ✅ เปิดใช้งาน

4. **ใส่ API Endpoint:**
   - แท็บ "Google Colab"
   - วาง URL จาก Colab
   - กด "บันทึก"

---

### ขั้นตอนที่ 3: สร้างภาพ

1. **ไปที่ AI Generation:**
   - คลิกเมนู "AI Generation"

2. **เลือก Template (ถ้าต้องการ):**
   - จะเห็น "🔞 NSFW Templates"
   - คลิกปุ่มที่ต้องการ:
     - Artistic Nude
     - Intimate Scene
     - Sensual Portrait
     - Realistic Nude
     - Explicit Content

3. **หรือเขียน Prompt เอง:**
   ```
   Prompt:
   beautiful asian woman, nude, bedroom, professional photography,
   soft lighting, photorealistic, detailed skin, 8k uhd

   Negative Prompt:
   ugly, bad anatomy, bad hands, bad quality, blurry, low resolution
   ```

4. **เลือกขนาดรูป:**
   - TikTok (9:16) - 720x1280
   - IG Story (9:16) - 1080x1920
   - Square (1:1) - 1024x1024
   - หรือกำหนดเอง

5. **ตั้งค่า (ถ้าต้องการ):**
   - Steps: 25-30
   - CFG Scale: 7-8
   - Seed: -1 (random)

6. **กด Generate:**
   - รอ 20-40 วินาที
   - จะได้รูปที่สร้าง

---

## 📊 การทำงานของระบบ

### เมื่อ NSFW Mode = OFF (ปิด)
```typescript
// Negative Prompt จะเป็น:
"ugly, bad quality, blurry, nsfw, nude, naked, explicit, adult content, sexual"
```
→ จะบล็อกภาพ NSFW ไม่ให้สร้าง

### เมื่อ NSFW Mode = ON (เปิด)
```typescript
// Negative Prompt จะเป็น:
"ugly, bad quality, blurry"
```
→ ไม่บล็อก NSFW, สร้างได้ตามต้องการ

---

## 🎨 Prompt Guidelines

### ✅ Prompt ที่ดี (NSFW)

```
Positive:
"beautiful woman, artistic nude, professional photography,
soft lighting, elegant pose, photorealistic, detailed skin,
8k uhd, high quality"

Negative:
"ugly, bad anatomy, bad hands, bad quality, blurry, low resolution"
```

### ✅ Prompt สำหรับ Explicit Content

```
Positive:
"explicit sexual content, photorealistic, bedroom scene,
detailed anatomy, cinematic lighting, high detail, 8k uhd,
professional photography, detailed skin texture"

Negative:
"ugly, bad anatomy, deformed, bad quality, blurry,
cartoon, 3d, low resolution"
```

### ❌ หลีกเลี่ยงคำเหล่านี้ใน Negative Prompt:
- ❌ nsfw
- ❌ nude
- ❌ naked
- ❌ explicit
- ❌ sexual

(ใส่ในนี้จะบล็อก NSFW content)

---

## ⚙️ การตั้งค่าที่แนะนำ

### สำหรับ ChilloutMix:
```
Model: ChilloutMix
Steps: 25-30
Sampler: DPM++ 2M Karras
CFG Scale: 7-8
Size: 512x768 หรือ 720x1280 (TikTok)
```

### สำหรับ Realistic Vision v6.0:
```
Model: Realistic Vision v6.0
Steps: 20-30
Sampler: DPM++ SDE Karras
CFG Scale: 6-7
Size: 512x768 หรือ 768x512
```

---

## 🔧 Troubleshooting

### ❌ "ไม่เห็น NSFW Templates"
**สาเหตุ:**
- ปิด NSFW Mode

**แก้:**
1. Settings > ทั่วไป
2. เปิด "Enable NSFW Mode (18+)"
3. กด "บันทึก"

---

### ❌ "รูปออกมาไม่ NSFW"
**สาเหตุ:**
- ใช้ Model ที่มี Filter (Flux, SD Base)
- ใส่ "nsfw, nude" ใน Negative Prompt

**แก้:**
1. ใช้ Uncensored Model (ChilloutMix, Realistic Vision)
2. เช็ค Negative Prompt ว่าไม่มี "nsfw, nude, naked"
3. เปิด NSFW Mode ใน Settings

---

### ❌ "Anatomy ผิดพลาด (มือ/เท้า/นิ้ว)"
**สาเหตุ:**
- CFG Scale สูงเกิน
- Steps น้อยเกิน

**แก้:**
1. เพิ่ม Negative:
   ```
   bad hands, bad fingers, bad anatomy, bad proportions,
   extra fingers, missing fingers, deformed hands
   ```
2. ลด CFG Scale เหลือ 6-7
3. เพิ่ม Steps เป็น 30-35
4. ใช้ Inpainting แก้ไขส่วนที่ผิด

---

### ❌ "ภาพมัว/คุณภาพต่ำ"
**แก้:**
1. เพิ่ม Positive:
   ```
   8k uhd, high resolution, detailed, professional photography,
   detailed skin texture, sharp focus
   ```
2. เพิ่ม Negative:
   ```
   blurry, low resolution, low quality, jpeg artifacts,
   pixelated, out of focus
   ```
3. เพิ่ม Steps เป็น 30+
4. ใช้ Hires Fix (ถ้ามี)

---

## 📁 ไฟล์ที่สำคัญ

```
📦 Project
├── 📄 NSFW_FEATURE_GUIDE.md         # คู่มือนี้
├── 📄 SD_NSFW_Colab.md              # คู่มือ Colab แบบละเอียด
├── 📄 COLAB_CELL_NSFW_MODELS.txt    # Cell สำหรับดาวน์โหลด Models
├── 📂 src/
│   ├── 📄 types/index.ts            # เพิ่ม nsfwMode
│   ├── 📄 pages/Settings.tsx        # NSFW Toggle
│   ├── 📄 pages/AIGeneration.tsx    # NSFW Templates
│   └── 📄 hooks/useAppContext.tsx   # Default nsfwMode: false
```

---

## 🎯 สรุปการใช้งาน (Quick Start)

```
1. [Colab] เพิ่ม Cell 2.0.2 จาก COLAB_CELL_NSFW_MODELS.txt
2. [Colab] รัน Cell 2.0.2 → ดาวน์โหลด ChilloutMix
3. [Colab] รัน Cell 1.0.1 → เปิด WebUI
4. [Colab] คัดลอก URL

5. [Web] Settings → เปิด NSFW Mode
6. [Web] Settings → Colab → ใส่ URL → Save
7. [Web] AI Generation → เลือก NSFW Template
8. [Web] กด Generate → รอ 30 วินาที → เสร็จ!
```

---

## 📚 เอกสารเพิ่มเติม

- **คู่มือ Colab:** `SD_NSFW_Colab.md`
- **Prompt Examples:** ดูใน `SD_NSFW_Colab.md` ส่วน "ตัวอย่าง Prompts"
- **Models Info:** ดูใน `SD_NSFW_Colab.md` ส่วน "Uncensored Models"

---

## 📝 Notes

- **สำหรับการใช้งานส่วนตัวเท่านั้น**
- ไม่มี Safety Filter หรือ Content Warning
- ผู้ใช้รับผิดชอบเนื้อหาที่สร้างเอง

---

สร้างเมื่อ: 2025-01-08
เวอร์ชั่น: 1.0.0
อัพเดตล่าสุด: 2025-01-08
