# 🔞 SDUnlimited - คู่มือการใช้งาน

---

## 📋 สารบัญ

1. [เกี่ยวกับ SDUnlimited](#เกี่ยวกับ-sdunlimited)
2. [ขั้นตอนการใช้งาน](#ขั้นตอนการใช้งาน)
3. [รายละเอียดแต่ละ Cell](#รายละเอียดแต่ละ-cell)
4. [การเชื่อมต่อกับเว็บไซต์](#การเชื่อมต่อกับเว็บไซต์)
5. [NSFW Models ที่รองรับ](#nsfw-models-ที่รองรับ)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 เกี่ยวกับ SDUnlimited

**SDUnlimited** คือ Google Colab Notebook ที่ออกแบบมาเฉพาะสำหรับ:
- ✅ สร้างภาพ NSFW แบบไม่จำกัด (Unlimited)
- ✅ ไม่มี Safety Filter หรือข้อจำกัดใดๆ
- ✅ รองรับ Uncensored Models 4 ตัว
- ✅ มี Anti-Timeout Protection
- ✅ เชื่อมต่อกับเว็บไซต์ https://aigen.ptee88.com/ ได้

---

## 🚀 ขั้นตอนการใช้งาน

### ⏱️ ครั้งแรก (Setup ครั้งเดียว):

```
1. เปิด SDUnlimited.ipynb ใน Google Colab
2. รัน Cell 1.0 → Setup & Install (5-10 นาที)
3. รัน Cell 2.0 → Anti-Timeout Protection
4. รัน Cell 3.0 → Download Models (5-15 นาที/Model)
5. รัน Cell 4.0 → Start WebUI (2-3 นาที)
6. รัน Cell 5.0 → ดู API URL
7. Copy URL ไปใส่ในเว็บไซต์
```

### 🔄 ครั้งถัดไป (ใช้งานปกติ):

```
1. เปิด SDUnlimited.ipynb
2. รัน Cell 2.0 → Anti-Timeout
3. รัน Cell 4.0 → Start WebUI
4. รัน Cell 5.0 → ดู API URL
5. Copy URL ไปใส่ในเว็บไซต์
```

---

## 📦 รายละเอียดแต่ละ Cell

### Cell 1.0 - 🔧 Setup & Install

**วัตถุประสงค์:** ติดตั้ง Stable Diffusion WebUI และ dependencies

**รันเมื่อไหร่:** ครั้งแรกเท่านั้น (หรือเมื่อต้องการติดตั้งใหม่)

**สิ่งที่ทำ:**
- Mount Google Drive
- สร้างโฟลเดอร์ `/content/drive/MyDrive/SD_Unlimited`
- ดาวน์โหลด Stable Diffusion WebUI
- ติดตั้ง dependencies (aria2, git, etc.)
- สร้าง symlinks สำหรับ models และ outputs

**เวลาที่ใช้:** 5-10 นาที

---

### Cell 2.0 - ⏰ Anti-Timeout Protection

**วัตถุประสงค์:** ป้องกัน Google Colab ไม่ให้ disconnect

**รันเมื่อไหร่:** ทุกครั้งที่เริ่มใช้งาน

**สิ่งที่ทำ:**
- รัน JavaScript ใน background
- Auto-click "Connect" button ทุก 5 นาที
- Ping API เพื่อ keep connection alive
- แสดงสถานะ "Anti-Timeout: ACTIVE" มุมขวาล่าง

**เวลาที่ใช้:** < 1 วินาที

**หมายเหตุ:**
- ✅ ไม่ต้องรันซ้ำ (จะทำงานเรื่อยๆ จนกว่าจะปิด Colab)
- ⚠️ ยังมีโอกาส disconnect ถ้าไม่มี activity นาน (~12 ชั่วโมง)

---

### Cell 3.0 - 🔞 Download NSFW Models

**วัตถุประสงค์:** ดาวน์โหลด Uncensored Models

**รันเมื่อไหร่:** ครั้งแรกเท่านั้น (ครั้งต่อไปจะข้ามถ้ามีไฟล์แล้ว)

**Models ที่มี:**

| Model | ขนาด | ลักษณะ | แนะนำสำหรับ |
|-------|------|---------|-------------|
| **ChilloutMix** | ~2.0 GB | Asian, Realistic | คนเอเชีย, ภาพสมจริง |
| **Realistic Vision v6.0** | ~2.3 GB | Western, Photorealistic | คนตะวันตก, ultra realistic |
| **DreamShaper 8** | ~2.0 GB | Artistic, Flexible | ศิลปะ, ยืดหยุ่น |
| **CyberRealistic v3.3** | ~2.2 GB | Ultra Realistic | ภาพสมจริงสูงสุด |

**วิธีเลือก Model:**

```python
ChilloutMix = True           # ✅ เปิด
RealisticVision_v60 = False  # ❌ ปิด
DreamShaper_8 = False        # ❌ ปิด
CyberRealistic_v33 = False   # ❌ ปิด
```

**เวลาที่ใช้:** 5-15 นาที ต่อ Model

**หมายเหตุ:**
- ✅ บันทึกลง Google Drive (ครั้งต่อไปไม่ต้องดาวน์โหลดใหม่)
- ⚠️ ต้องมี Google Drive เหลืออย่างน้อย 10 GB

---

### Cell 4.0 - 🚀 Start Stable Diffusion WebUI

**วัตถุประสงค์:** เปิด WebUI พร้อม API Server

**รันเมื่อไหร่:** ทุกครั้งที่ต้องการใช้งาน

**สิ่งที่ทำ:**
- เริ่ม Stable Diffusion WebUI
- เปิด API mode
- สร้าง Public URL (Gradio/Cloudflare)
- ปิด NSFW Filter และ Safety Checker
- เปิด xFormers (สร้างภาพเร็วขึ้น)

**Configuration:**
```bash
--api                           # เปิด API
--cors-allow-origins=*          # อนุญาตทุก origin
--share                         # สร้าง public URL
--xformers                      # ใช้ xFormers (เร็วขึ้น)
--disable-safe-unpickle         # ปิด safety check
--lowvram                       # ใช้ RAM น้อย
```

**เวลาที่ใช้:** 2-3 นาที

**Output ที่สำคัญ:**
```
Running on local URL:  http://127.0.0.1:7860
Running on public URL: https://xxxxx.gradio.live
```
→ **Copy URL นี้!**

---

### Cell 5.0 - 📊 Status Dashboard

**วัตถุประสงค์:** แสดงสถานะและข้อมูลสำคัญ

**รันเมื่อไหร่:** เมื่อต้องการดู Status หรือ API URL

**สิ่งที่แสดง:**
- ✅ สถานะการทำงาน (RUNNING)
- 🔗 API Endpoint (คำแนะนำหา URL)
- 📦 Models ที่ดาวน์โหลดแล้ว
- 📝 ขั้นตอนต่อไป (Step by step)

**เวลาที่ใช้:** < 1 วินาที

---

## 🌐 การเชื่อมต่อกับเว็บไซต์

### ขั้นตอนที่ 1: เปิด Cell 4.0 แล้ว Copy URL

จาก Cell 4.0 จะเห็นข้อความแบบนี้:

```
Running on public URL: https://xxxxxxxx.gradio.live
```

หรือ

```
Running on public URL: https://xxxxxxxx.trycloudflare.com
```

→ **Copy URL นี้ทั้งหมด**

---

### ขั้นตอนที่ 2: ไปที่เว็บไซต์

1. เปิด https://aigen.ptee88.com/
2. คลิก **Settings** (⚙️)

---

### ขั้นตอนที่ 3: ใส่ API URL

1. คลิกแท็บ **"Google Colab"**
2. หาช่อง **"API Endpoint"**
3. วาง URL ที่ copy มา
4. กดปุ่ม **"บันทึก"**

---

### ขั้นตอนที่ 4: เปิด NSFW Unlimited Mode

1. เลื่อนขึ้นมาที่แท็บ **"ทั่วไป"**
2. หาตัวเลือก **"🔞 NSFW Unlimited Mode (18+)"**
3. เปิดสวิตช์ให้เป็นสีน้ำเงิน ✅
4. กดปุ่ม **"บันทึก"** อีกครั้ง

---

### ขั้นตอนที่ 5: ทดสอบสร้างภาพ

1. คลิกเมนู **"AI Generation"**
2. เลื่อนลงมาจะเห็น **"🔞 NSFW Unlimited Templates"**
3. คลิกปุ่ม **"Artistic Nude"** (เพื่อทดสอบ)
4. เลือกขนาดรูป เช่น **"Square (1:1)"**
5. กดปุ่ม **"Generate Image"**
6. รอ 20-40 วินาที
7. ✅ เสร็จ!

---

## 🎨 NSFW Models ที่รองรับ

### 1. ChilloutMix (แนะนำ!)

**ข้อมูล:**
- 🌏 เหมาะสำหรับ: คนเอเชีย
- 🎨 สไตล์: Realistic, Photorealistic
- 🔞 NSFW: ไม่มีข้อจำกัด
- 💾 ขนาด: ~2.0 GB

**Prompt ที่แนะนำ:**
```
beautiful asian woman, nude, professional photography,
soft lighting, detailed skin, photorealistic, 8k uhd
```

**Settings ที่แนะนำ:**
- Steps: 25-30
- CFG Scale: 7-8
- Sampler: DPM++ 2M Karras
- Size: 512x768 หรือ 720x1280

---

### 2. Realistic Vision v6.0

**ข้อมูล:**
- 🌍 เหมาะสำหรับ: คนตะวันตก
- 🎨 สไตล์: Ultra Photorealistic
- 🔞 NSFW: ไม่มีข้อจำกัด
- 💾 ขนาด: ~2.3 GB

**Prompt ที่แนะนำ:**
```
photorealistic woman, nude, bedroom scene,
natural lighting, detailed anatomy, 8k uhd, high detail
```

**Settings ที่แนะนำ:**
- Steps: 20-30
- CFG Scale: 6-7
- Sampler: DPM++ SDE Karras
- Size: 512x768 หรือ 768x512

---

### 3. DreamShaper 8

**ข้อมูล:**
- 🎨 สไตล์: Artistic, Flexible
- 🔞 NSFW: ไม่มีข้อจำกัด
- 💾 ขนาด: ~2.0 GB

**Prompt ที่แนะนำ:**
```
artistic nude, beautiful woman, elegant pose,
soft lighting, painting style, high quality, detailed
```

**Settings ที่แนะนำ:**
- Steps: 25-35
- CFG Scale: 7-9
- Sampler: Euler a
- Size: 512x768

---

### 4. CyberRealistic v3.3

**ข้อมูล:**
- 🎨 สไตล์: Ultra Realistic, Cinematic
- 🔞 NSFW: ไม่มีข้อจำกัด
- 💾 ขนาด: ~2.2 GB

**Prompt ที่แนะนำ:**
```
ultra realistic woman, nude, detailed skin texture,
cinematic lighting, professional photography, 8k uhd,
detailed anatomy, photorealistic
```

**Settings ที่แนะนำ:**
- Steps: 30-40
- CFG Scale: 6-7
- Sampler: DPM++ 2M Karras
- Size: 768x512 หรือ 1024x768

---

## 🔧 Troubleshooting

### ❌ "Cell 4.0 ไม่แสดง Public URL"

**สาเหตุ:**
- Gradio หรือ Cloudflare ไม่สามารถสร้าง tunnel ได้

**แก้:**
1. รอสักครู่ (1-2 นาที) บางทีต้องใช้เวลา
2. ถ้ายังไม่ขึ้น ให้ดูที่ `Running on local URL: http://127.0.0.1:7860`
3. ใช้ ngrok แทน:
   ```python
   !pip install pyngrok
   from pyngrok import ngrok
   public_url = ngrok.connect(7860)
   print(f"Public URL: {public_url}")
   ```

---

### ❌ "เว็บไซต์บอก 'Failed to connect to API'"

**สาเหตุ:**
- URL ผิด
- Cell 4.0 ยังไม่เสร็จ
- Colab disconnect แล้ว

**แก้:**
1. เช็คว่า Cell 4.0 ยังทำงานอยู่
2. เช็ค URL ที่ใส่ในเว็บไซต์ว่าถูกต้อง
3. ลอง refresh เว็บไซต์
4. ลองรัน Cell 4.0 ใหม่

---

### ❌ "ภาพออกมาไม่ใช่ NSFW"

**สาเหตุ:**
- ยังไม่เปิด NSFW Unlimited Mode
- Prompt ไม่ชัดเจน
- Model ไม่ใช่ Uncensored

**แก้:**
1. เช็คว่าเปิด NSFW Unlimited Mode ใน Settings แล้ว
2. ใช้ NSFW Templates ที่มีให้
3. เช็คว่า Model ที่เลือกใน WebUI เป็น ChilloutMix หรือ Realistic Vision
4. ลบคำว่า "nsfw, nude, naked" ออกจาก Negative Prompt

---

### ❌ "มือ/เท้า/นิ้ว ผิดรูป (Anatomy Error)"

**สาเหตุ:**
- CFG Scale สูงเกิน
- Steps น้อยเกิน
- Model ไม่เหมาะกับ prompt

**แก้:**
1. เพิ่ม Negative Prompt:
   ```
   bad hands, bad fingers, bad anatomy, bad proportions,
   extra fingers, missing fingers, deformed hands,
   mutated hands, fused fingers
   ```
2. ลด CFG Scale เหลือ 6-7
3. เพิ่ม Steps เป็น 30-35
4. ใช้ Inpainting แก้ไขส่วนที่ผิด

---

### ❌ "Colab บอก 'Out of Memory'"

**สาเหตุ:**
- ขนาดรูปใหญ่เกิน
- GPU RAM ไม่พอ

**แก้:**
1. ลดขนาดรูปลง (เช่น จาก 1024x1024 เป็น 512x512)
2. เพิ่ม `--lowvram` ใน Cell 4.0 (มีอยู่แล้ว)
3. ใช้ Colab Pro (มี GPU ที่ดีกว่า)

---

### ❌ "Colab Disconnect ทั้งๆ ที่มี Anti-Timeout"

**สาเหตุ:**
- ใช้งานเกิน 12 ชั่วโมง
- Google Colab มี limit สำหรับ Free tier

**แก้:**
1. รัน Cell 4.0 ใหม่ (จะได้ URL ใหม่)
2. นำ URL ใหม่ไปใส่ในเว็บไซต์
3. พิจารณาใช้ Colab Pro สำหรับ session ที่ยาวขึ้น

---

## 📊 เปรียบเทียบ SDUnlimited vs ZenityX

| ฟีเจอร์ | SDUnlimited | ZenityX |
|---------|-------------|---------|
| เฉพาะ NSFW | ✅ ใช่ | ❌ ไม่ใช่ |
| Anti-Timeout | ✅ มี | ⚠️ ไม่มี |
| Status Dashboard | ✅ มี | ❌ ไม่มี |
| ลำดับขั้นตอนชัดเจน | ✅ ใช่ | ⚠️ สับสน |
| คำแนะนำภาษาไทย | ✅ ครบ | ⚠️ บางส่วน |
| Models รวมอยู่ | ✅ 4 Models | ⚠️ ต้องหาเอง |

---

## 🎯 สรุป Quick Start

```
📋 ขั้นตอนสั้นๆ (ครั้งแรก):

1. เปิด SDUnlimited.ipynb
2. รัน Cell 1.0 (Setup)
3. รัน Cell 2.0 (Anti-Timeout)
4. รัน Cell 3.0 (Download Models - เลือก ChilloutMix)
5. รัน Cell 4.0 (Start WebUI)
6. Copy URL จาก Cell 4.0
7. ไปที่ https://aigen.ptee88.com/
8. Settings → Colab → วาง URL → Save
9. Settings → ทั่วไป → เปิด NSFW Unlimited Mode → Save
10. AI Generation → เลือก Template → Generate!
```

---

## 📝 Notes

- **สำหรับการใช้งานส่วนตัวเท่านั้น**
- ไม่มี Safety Filter หรือ Content Warning
- ผู้ใช้รับผิดชอบเนื้อหาที่สร้างเอง
- URL จะหมดอายุเมื่อปิด Colab
- Models จะถูกบันทึกใน Google Drive

---

## 🔗 ลิงก์ที่เกี่ยวข้อง

- เว็บไซต์: https://aigen.ptee88.com/
- Stable Diffusion WebUI: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- Civitai (Models): https://civitai.com/

---

สร้างเมื่อ: 2025-01-08
เวอร์ชั่น: 1.0.0
อัพเดตล่าสุด: 2025-01-08
