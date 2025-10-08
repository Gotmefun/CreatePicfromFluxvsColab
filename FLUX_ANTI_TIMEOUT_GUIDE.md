# 🛡️ Flux AI - Anti-Timeout Edition

## 🎯 คู่มือการใช้งาน Colab ที่ไม่ Timeout

---

## 📋 สิ่งที่ได้รับการปรับปรุง

### ✅ ปัญหาเดิม:
- ❌ Colab timeout หลัง 30-90 นาที
- ❌ ต้องมานั่งคลิกหน้าจอทุกครั้ง
- ❌ ngrok tunnel หลุดบ่อย
- ❌ ไม่รู้ว่ายังทำงานอยู่หรือเปล่า

### ✨ ฟีเจอร์ใหม่:
- ✅ **Anti-Timeout Protection** - คลิกปุ่ม Connect อัตโนมัติทุก 5 นาที
- ✅ **Auto Keep-Alive** - ส่ง ping ไปที่ API ทุก 5 นาที
- ✅ **Status Monitor** - แสดงสถานะแบบ Real-time
- ✅ **Statistics Tracking** - นับจำนวนรูปที่สร้าง
- ✅ **Health Check Endpoint** - ตรวจสอบว่ายังทำงานอยู่
- ✅ **Memory Optimization** - ใช้ RAM น้อยลง

---

## 🚀 วิธีใช้งาน

### ขั้นตอนที่ 1: อัพโหลด Notebook

1. เปิด [Google Colab](https://colab.research.google.com/)
2. กด **File** > **Upload notebook**
3. เลือกไฟล์ `Flux_AI_Colab_Anti_Timeout.ipynb`
4. เปิดใช้งาน GPU:
   - **Runtime** > **Change runtime type**
   - **Hardware accelerator** = **GPU** (T4)
   - กด **Save**

---

### ขั้นตอนที่ 2: รัน Notebook

รันตามลำดับ (อย่าข้ามขั้นตอน):

#### 1️⃣ Cell 1: Anti-Timeout Setup
```
🛡️ เปิดใช้งาน Anti-Timeout Protection
⏰ คลิกปุ่ม Connect อัตโนมัติทุก 5 นาที
💡 รันครั้งเดียวตอนเริ่มต้น
```

**ผลลัพธ์:**
- เห็นกล่องสีเขียว "Anti-Timeout Protection Enabled!"
- มี Status Box แสดง Uptime และ Keep-Alive count

---

#### 2️⃣ Cell 2: Install Dependencies
```
📦 ติดตั้ง packages
⏳ ใช้เวลา 2-3 นาที
```

รอจนเห็น:
```
✅ ติดตั้ง dependencies สำเร็จ!
```

---

#### 3️⃣ Cell 3: Load Flux Model
```
🤖 โหลด Flux AI Model
⏳ ใช้เวลา 3-5 นาที (โหลดครั้งเดียว)
```

**เลือก Model:**
- `FLUX.1-schnell` = เร็ว (4 steps) 🚀 **แนะนำ**
- `FLUX.1-dev` = ช้า (20-50 steps) แต่คุณภาพสูงกว่า

รอจนเห็น:
```
✅ โหลด Flux Model สำเร็จ!
```

---

#### 4️⃣ Cell 4: Start API Server
```
🌐 เริ่ม API Server พร้อม Keep-Alive
🔗 สร้าง Public URL ด้วย ngrok
```

**ใส่ข้อมูล:**
- `NGROK_TOKEN` = Token จาก [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
- `PORT` = 5000 (ค่าเริ่มต้น)

รอจนเห็นกล่องสีม่วงพร้อม **Public URL**

**ตัวอย่าง URL:**
```
https://xxxx-xx-xxx-xxx-xxx.ngrok-free.app
```

---

### ขั้นตอนที่ 3: เชื่อมต่อกับเว็บไซต์

1. **คัดลอก URL** จาก Cell 4
2. เปิดเว็บไซต์ของคุณ
3. ไปที่ **Settings** ⚙️
4. เลื่อนลงมาที่ **Google Colab Settings**
5. วาง URL ลงใน **API Endpoint**
6. กด **Save Settings**

---

### ขั้นตอนที่ 4: ทดสอบ

1. ไปที่หน้า **AI Generation**
2. ใส่ Prompt:
   ```
   beautiful woman, professional photo, high quality
   ```
3. กด **Generate**
4. รอ 10-15 วินาที
5. จะเห็นรูปที่สร้างได้!

---

## 🛡️ Anti-Timeout ทำงานอย่างไร?

### 1. JavaScript Auto-Click (Cell 1)
```javascript
// คลิกปุ่ม Connect ทุก 5 นาที
setInterval(clickConnect, 300000);
```

- Colab จะคิดว่าคุณยังใช้งานอยู่
- ไม่ disconnect อัตโนมัติ
- **ต้องเปิดแท็บไว้** (ย่อได้ แต่อย่าปิด)

### 2. Keep-Alive Ping (Cell 4)
```python
# ส่ง HTTP request ทุก 5 นาที
requests.get(f'http://localhost:{PORT}/health')
```

- รักษา ngrok tunnel ไม่ให้หลุด
- แสดงว่า API ยังทำงานอยู่

### 3. Health Check Endpoint
```
GET /health
```

ตอบกลับ:
```json
{
  "status": "healthy",
  "uptime_seconds": 3600,
  "stats": {
    "total_requests": 10,
    "successful": 10,
    "failed": 0
  }
}
```

---

## 📊 Monitor Status

รัน **Cell 5** เพื่อดูสถิติ:

```
📊 API SERVER STATUS
==================================================================
🟢 Status: Running
⏰ Uptime: 1h 23m
🤖 Model: black-forest-labs/FLUX.1-schnell
==================================================================
📈 STATISTICS:
==================================================================
   Total Requests:      15
   ✅ Successful:        15
   ❌ Failed:            0
   🕐 Last Request:      14:30:25
==================================================================
```

---

## ⚙️ การตั้งค่าขั้นสูง

### เปลี่ยน Model

แก้ในเซลล์ 3:
```python
MODEL_NAME = "black-forest-labs/FLUX.1-dev"  # คุณภาพสูงกว่า
```

### ปรับ Keep-Alive Interval

แก้ในเซลล์ 4:
```python
time.sleep(300)  # 300 = 5 นาที, ลดเป็น 180 = 3 นาที
```

### ปรับ Generation Settings

ส่งใน request body:
```json
{
  "prompt": "your prompt",
  "steps": 4,           // schnell = 4, dev = 20-50
  "width": 1024,        // 512, 768, 1024
  "height": 1024,
  "guidance_scale": 0.0 // schnell ไม่ใช้, dev ใช้ 7.5
}
```

---

## ❓ Troubleshooting

### ❌ "Cell 1 แสดงว่า Keep-Alive ไม่ทำงาน"

**วิธีแก้:**
1. Refresh หน้า Colab
2. รัน Cell 1 ใหม่
3. ตรวจสอบว่าไม่ได้ปิดแท็บ

---

### ❌ "Cell 3 ขึ้น CUDA Out of Memory"

**วิธีแก้:**
1. **Runtime** > **Restart Runtime**
2. เปลี่ยนเป็น `FLUX.1-schnell` (ใช้ RAM น้อยกว่า)
3. หรือรอสักครู่แล้วลองใหม่

---

### ❌ "Cell 4 ขึ้น ngrok authentication failed"

**วิธีแก้:**
1. ไปที่ https://dashboard.ngrok.com/get-started/your-authtoken
2. คัดลอก token ใหม่
3. แทนที่ `NGROK_TOKEN` ใน Cell 4
4. รัน Cell 4 ใหม่

---

### ❌ "เว็บไซต์ขึ้น Timeout หรือ API Error"

**ตรวจสอบ:**
1. Colab ยังทำงานอยู่ไหม? (ดูที่ Cell 5)
2. ngrok URL ยังใช้ได้ไหม? (เปิดใน browser)
3. Settings ใส่ URL ถูกต้องไหม?

**วิธีแก้:**
1. รัน Cell 4 ใหม่ (จะได้ URL ใหม่)
2. คัดลอก URL ใหม่ไปใส่ใน Settings
3. ลองสร้างรูปใหม่

---

### ❌ "Colab ยัง Timeout แม้จะรัน Cell 1 แล้ว"

**สาเหตุ:**
- ปิดแท็บ Colab = Anti-Timeout หยุดทำงาน
- หรือ browser ปิด JavaScript

**วิธีแก้:**
1. **ต้องเปิดแท็บไว้** (ย่อได้)
2. อย่าใช้ "Suspend tabs" (Chrome extension)
3. เปิด JavaScript ใน browser

---

## 💡 Tips & Tricks

### 1. ประหยัดเวลา
- ใช้ `FLUX.1-schnell` (4 steps) = 10-15 วินาที/รูป
- ใช้ `FLUX.1-dev` (20 steps) = 30-60 วินาที/รูป

### 2. ประหยัด RAM
- ขนาดรูป 512x512 หรือ 768x768 (อย่าเกิน 1024x1024)
- ปิดแท็บอื่นๆ ที่ไม่ใช้

### 3. ngrok Free Limit
- ฟรี: 40 connections/minute
- ถ้าใช้เยอะ: อัพเกรดเป็น [ngrok Pro](https://ngrok.com/pricing)

### 4. Colab Free Limit
- ประมาณ 12 ชั่วโมง/วัน
- ถ้าต้องการมากกว่า: [Colab Pro](https://colab.research.google.com/signup) (343฿/เดือน)

### 5. Auto-Save Session
- Colab จะบันทึกอัตโนมัติ
- แต่ควร **Download** notebook เก็บไว้

---

## 🎯 สรุป

### ทำตามนี้จะไม่ Timeout:

1. ✅ รัน Cell 1 (Anti-Timeout)
2. ✅ เปิดแท็บไว้ (ย่อได้ อย่าปิด)
3. ✅ ใช้ ngrok token ที่ถูกต้อง
4. ✅ ตรวจสอบสถานะด้วย Cell 5

### ข้อจำกัด:

- 📱 **ต้องเปิดแท็บไว้** - ถ้าปิดจะ timeout
- ⏰ **Colab Free = 12h/วัน** - ถ้าหมดต้อง upgrade
- 🔗 **ngrok Free = URL เปลี่ยนทุกครั้ง** - ต้ออัพเดต Settings

---

## 📞 ติดต่อสอบถาม

หากมีปัญหาหรือข้อสงสัย:
- GitHub Issues
- หรือ Facebook Page ของคุณ

---

## 🎉 เวอร์ชั่น

- **v2.0.0** - Anti-Timeout Edition (2025-01-08)
  - เพิ่ม Anti-Timeout Protection
  - เพิ่ม Keep-Alive System
  - เพิ่ม Health Check & Statistics
  - ปรับปรุง Memory Management

- **v1.0.0** - Initial Release
  - Flux AI Basic Setup

---

สร้างโดย: Claude Code 🤖
อัพเดตล่าสุด: 2025-01-08
