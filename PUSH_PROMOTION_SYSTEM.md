# 🚀 Push Promotion System - คู่มือการใช้งาน

## 🎯 ภาพรวม

ระบบ **Push Promotion** เป็นเครื่องมือสำหรับแอดมินในการส่งข้อความโปรโมชั่น ประกาศ หรือข้อมูลข่าวสาร ไปยังลูกค้าผ่าน LINE Official Account แบบง่ายๆ ผ่านหน้าเว็บเดียว

**หลักการ:** แทนที่จะให้บอทตอบคำถาม → แอดมินส่งข้อความ push ไปหาลูกค้าเอง ทำงานง่าย ไม่ซ้ำซ้อน

---

## ✨ ฟีเจอร์หลัก

### 1. 📝 เลือก Template หรือเขียนเอง
- เลือกจาก Quick Response Templates ที่มีอยู่
- หรือเขียนข้อความเองได้เลย (Custom Message)
- แก้ไขข้อความก่อนส่งได้

### 2. 👥 เลือก Users
- **ส่งให้ทุกคน** - ส่งไปยัง users ทั้งหมดในระบบ
- **เลือกเอง** - เลือก users เฉพาะคนที่ต้องการ (checkbox)

### 3. 👁️ Preview ก่อนส่งจริง
- ส่ง preview ไปยัง LINE User ID ของตัวเอง
- ตรวจสอบข้อความว่าถูกต้องก่อนส่งจริง

### 4. 🚀 ส่งแบบ Bulk
- ส่งพร้อมกันหลายคน
- แสดงผลสำเร็จ/ล้มเหลว
- มี error handling ถ้าส่งไม่สำเร็จ

### 5. 📊 ดูประวัติการส่ง (History)
- เก็บประวัติ 100 รายการล่าสุด
- แสดง timestamp, จำนวนคน, ความสำเร็จ
- ดูข้อความที่เคยส่งย้อนหลังได้

---

## 🖥️ วิธีใช้งาน (Step-by-Step)

### ขั้นตอนที่ 1: เข้าสู่ระบบ

1. เปิดเบราว์เซอร์ไปที่:
   ```
   https://your-domain.com/admin/push
   ```

2. ใส่ **Admin Token** (เดียวกับ `ADMIN_TOKEN` ใน `.env`)

3. กด **Login**

---

### ขั้นตอนที่ 2: เลือกข้อความที่จะส่ง

#### วิธีที่ 1: ใช้ Template (แนะนำ)
1. เลือก **"ใช้ Template"**
2. เลือก template จาก dropdown เช่น:
   - `PROMOTION_NEW_MEMBER` - โปรสมาชิกใหม่
   - `MINIMUM_DEPOSIT` - ฝากขั้นต่ำ
   - `HOW_TO_DEPOSIT` - วิธีฝากเงิน
3. ข้อความจะแสดงในกล่องข้อความด้านล่างโดยอัตโนมัติ

#### วิธีที่ 2: เขียนเอง (Custom)
1. เลือก **"เขียนเอง (Custom)"**
2. พิมพ์ข้อความที่ต้องการในกล่องข้อความ
3. สามารถใช้อีโมจิ ขึ้นบรรทัดใหม่ได้

**ตัวอย่างข้อความ:**
```
💰 โปรพิเศษวันนี้! 💰

ฝาก 100 รับ 150
ฝาก 300 รับ 400

🎉 รับโบนัสทันที ถอนได้เลย!
📞 สนใจ LINE: @mechoke
```

---

### ขั้นตอนที่ 3: เลือก Users

#### ส่งให้ทุกคน (แนะนำ)
- ✅ เช็ค **"ส่งให้ทุกคน"**
- ระบบจะส่งไปยัง users ทั้งหมด

#### เลือก Users เฉพาะคน
- ❌ ยกเลิกเช็ค "ส่งให้ทุกคน"
- เลือก checkbox หน้า users ที่ต้องการ
- จำนวนที่เลือกจะแสดงด้านบน

---

### ขั้นตอนที่ 4: ทดสอบด้วย Preview (แนะนำ)

1. กรอก **User ID** ของคุณเอง (LINE User ID)
   - หา User ID ได้จาก `/api/debug/users`
   - หรือให้ลูกค้าทักมาแล้วดูที่ logs

2. กด **"ส่ง Preview"**

3. ตรวจสอบข้อความที่ได้รับใน LINE
   - จะมีคำว่า `🔍 [PREVIEW]` นำหน้า

4. ถ้าถูกต้องแล้ว → ไปขั้นตอนถัดไป

---

### ขั้นตอนที่ 5: ส่ง Promotion

1. ตรวจสอบข้อความและจำนวน users อีกครั้ง

2. กด **"ส่งไปยัง XX คน"** (ปุ่มใหญ่สีม่วง)

3. ยืนยันการส่ง (จะมี popup ถาม)

4. รอระบบส่ง (จะแสดงสถานะ "กำลังส่ง...")

5. เสร็จแล้วจะแสดงผล:
   ```
   ✅ ส่งสำเร็จ 95/100 คน
   ```

---

### ขั้นตอนที่ 6: ดูประวัติ (ถ้าต้องการ)

1. กดปุ่ม **"📊 History"** ด้านบนขวา

2. ดูประวัติการส่งทั้งหมด:
   - วันเวลาที่ส่ง
   - จำนวนคนที่ส่ง
   - ความสำเร็จ
   - ข้อความที่ส่ง (80 ตัวอักษรแรก)

3. กด **✕** เพื่อปิดหน้าต่าง

---

## 📁 โครงสร้างระบบ

```
app/
├── admin/push/
│   └── page.tsx                    # Admin Panel UI (หน้าหลัก)
├── api/admin/push/
│   ├── send/route.ts               # POST - ส่ง bulk messages
│   ├── preview/route.ts            # POST - ส่ง preview
│   └── history/route.ts            # GET - ดูประวัติ

lib/
└── push-history.ts                 # In-memory history storage
```

---

## 🔌 API Endpoints

### 1. POST `/api/admin/push/send`
ส่งข้อความไปยัง users หลายคน

**Request:**
```json
{
  "userIds": ["U123...", "U456..."],
  "message": "ข้อความที่จะส่ง",
  "templateKey": "promotion_new_member"  // optional
}
```

**Response:**
```json
{
  "ok": true,
  "totalCount": 100,
  "successCount": 95,
  "failedCount": 5,
  "message": "Sent to 95/100 users"
}
```

**Authentication:** Bearer token

---

### 2. POST `/api/admin/push/preview`
ส่ง preview ไปยัง 1 user

**Request:**
```json
{
  "userId": "U1234567890abcdef...",
  "message": "ข้อความทดสอบ"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Preview sent successfully",
  "userId": "U123456789..."
}
```

**หมายเหตุ:** ข้อความที่ส่งจะมี `🔍 [PREVIEW]` นำหน้า

---

### 3. GET `/api/admin/push/history?limit=50`
ดึงประวัติการส่ง

**Response:**
```json
{
  "ok": true,
  "count": 10,
  "history": [
    {
      "timestamp": "2025-01-15T10:30:00.000Z",
      "totalCount": 100,
      "successCount": 95,
      "failedCount": 5,
      "message": "💰 โปรพิเศษวันนี้...",
      "templateKey": "promotion_new_member"
    }
  ]
}
```

---

## 🛡️ ความปลอดภัย

1. **Authentication Required**
   - ทุก endpoint ต้องมี Admin Token
   - ต้องใส่ใน header: `Authorization: Bearer YOUR_TOKEN`

2. **Validation**
   - ตรวจสอบ input ทุกครั้ง
   - ป้องกัน injection/XSS

3. **Error Handling**
   - ถ้าส่งไม่สำเร็จบาง users → ยังคงส่งต่อ users อื่น
   - แสดงผลว่าส่งสำเร็จ/ล้มเหลวกี่คน

4. **Rate Limiting**
   - แนะนำให้เพิ่ม rate limit สำหรับการส่ง bulk
   - ป้องกันการส่งซ้ำบ่อยเกินไป

---

## 📊 ข้อมูล History

### In-Memory Storage (ปัจจุบัน)
- เก็บใน RAM (ephemeral)
- เก็บ 100 รายการล่าสุด
- **หายเมื่อ restart/deploy**

### แนะนำสำหรับ Production
ใช้ database แทน เช่น:
- **Vercel Postgres** (แนะนำ - ง่าย ฟรี)
- **MongoDB Atlas** (NoSQL)
- **Supabase** (PostgreSQL)
- **PlanetScale** (MySQL)

**ตัวอย่าง Schema:**
```sql
CREATE TABLE push_history (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  total_count INT,
  success_count INT,
  failed_count INT,
  message TEXT,
  template_key VARCHAR(100)
);
```

---

## 🎨 UI Screenshot ตัวอย่าง

```
┌─────────────────────────────────────────────────────────┐
│  🚀 Push Promotion System              📊 History Logout │
│  Users: 150 คน | Templates: 11 รายการ                     │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌─────────────────┐
│ 📝 เลือก Template    │  │ 👥 เลือก Users  │
│ ○ ใช้ Template       │  │ ✅ ส่งให้ทุกคน   │
│ ○ เขียนเอง (Custom) │  │    (150 คน)     │
│                      │  │                 │
│ [Dropdown Template]  │  └─────────────────┘
│                      │
│ ┌──────────────────┐ │
│ │ ข้อความ:         │ │
│ │                  │ │
│ │ 💰 โปรพิเศษ...   │ │
│ │                  │ │
│ └──────────────────┘ │
└──────────────────────┘

┌─────────────────────────────────────────┐
│ 👁️ ส่ง Preview                         │
│ [User ID]  [ส่ง Preview]              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🚀 ส่ง Promotion                        │
│ [   ส่งไปยัง 150 คน   ]                │
│ ✅ ส่งสำเร็จ 145/150 คน                 │
└─────────────────────────────────────────┘
```

---

## 💡 Tips & Best Practices

### 1. ทดสอบก่อนส่งจริงเสมอ
✅ ใช้ Preview ส่งให้ตัวเองก่อน
✅ ตรวจสอบ typo, อีโมจิ, ลิงก์

### 2. เลือกเวลาส่งที่เหมาะสม
✅ เช้า 9-11 น. / บ่าย 14-16 น. / เย็น 18-20 น.
❌ ดึก กลางคืน (รบกวนลูกค้า)

### 3. ไม่ส่งบ่อยเกินไป
✅ ส่งวันละ 1-2 ครั้ง (promotion สำคัญ)
❌ ส่งทุกชั่วโมง (ลูกค้ารำคาญ → block)

### 4. ข้อความชัดเจน กระชับ
✅ ใส่อีโมจิพอประมาณ
✅ บอกรายละเอียดครบ
✅ มี Call-to-Action ชัดเจน

### 5. เก็บ History สำรอง
✅ Screenshot ผลการส่ง
✅ เก็บข้อความที่ส่ง
✅ วิเคราะห์ว่าโปรไหนได้ผล

---

## ⚠️ ข้อควรระวัง

### 1. LINE API Limits
- **500 messages/second** (Free tier)
- **Push messages มีจำกัด** (ตาม plan)
- เกินโควตา → ส่งไม่ออก

### 2. Block/Unfollow
- ถ้า user block/unfollow → ส่งไม่ถึง (error)
- ระบบจะ skip และส่งต่อ users อื่น

### 3. Invalid User ID
- ถ้า User ID ไม่ถูกต้อง → error
- ตรวจสอบ User ID ให้ถูกต้อง

---

## 🔮 ฟีเจอร์เพิ่มเติมในอนาคต (ถ้าต้องการ)

- [ ] **Schedule Send** - กำหนดเวลาส่ง
- [ ] **Flex Message** - ส่งแบบมีรูป/ปุ่ม
- [ ] **Segmentation** - แบ่งกลุ่ม users (VIP, New, Inactive)
- [ ] **Analytics** - วิเคราะห์ open rate, click rate
- [ ] **A/B Testing** - ทดสอบข้อความหลายแบบ
- [ ] **Rich Menu** - เปลี่ยน Rich Menu จาก admin panel
- [ ] **Auto Reminder** - ส่งอัตโนมัติตามเงื่อนไข
- [ ] **Database Storage** - เก็บ history แบบถาวร

---

## 🆘 Troubleshooting

### ปัญหา: ล็อกอินไม่ได้
**สาเหตุ:** Token ไม่ถูกต้อง
**แก้ไข:** ตรวจสอบ `ADMIN_TOKEN` ใน `.env`

### ปัญหา: ส่งไม่ออก
**สาเหตุ:** LINE_CHANNEL_ACCESS_TOKEN ไม่ถูกต้อง
**แก้ไข:** ตรวจสอบ token ใน `.env`

### ปัญหา: ส่งสำเร็จบางคน
**สาเหตุ:** บาง users block/unfollow หรือ User ID ผิด
**แก้ไข:** เป็นเรื่องปกติ ระบบจะ skip ไป

### ปัญหา: History หาย
**สาเหตุ:** In-memory storage รีเซ็ตตอน deploy
**แก้ไข:** ใช้ database แทน (ดูที่ "แนะนำสำหรับ Production")

---

## 📞 ติดต่อ/สอบถาม

- GitHub Issues: https://github.com/ExP3eSsiOn/mechoke-ai/issues
- LINE: @mechoke

---

**สรุป:** ระบบ Push Promotion ช่วยให้แอดมินส่งโปรโมชั่นได้ง่าย รวดเร็ว ไม่ซับซ้อน ผ่านหน้าเว็บเดียว 🚀
