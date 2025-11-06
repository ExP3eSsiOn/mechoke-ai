// lib/response-validator.ts
// ตรวจสอบคำตอบก่อนส่งให้ลูกค้า เพื่อป้องกันข้อมูลผิดพลาด

export type ValidationResult = {
  isValid: boolean;
  reason?: string;
  shouldEscalate?: boolean;
};

/**
 * ตรวจสอบว่าคำตอบมีข้อมูลที่อาจผิดพลาดหรือไม่
 */
export function validateAIResponse(response: string): ValidationResult {
  const lower = response.toLowerCase();

  // 1. ห้ามระบุตัวเลขเงินที่แน่นอนมากเกินไป (เช่น ได้เงิน 5000 บาท)
  if (/ได้เงิน\s*\d{4,}|รับเงิน\s*\d{4,}|จ่าย\s*\d{4,}/i.test(response)) {
    return {
      isValid: false,
      reason: "ระบุจำนวนเงินแน่นอนโดยไม่ได้ตรวจสอบ",
      shouldEscalate: true,
    };
  }

  // 2. ห้ามให้ยูสเซอร์/รหัสผ่าน
  if (/(username|password|ยูสเซอร์|รหัสผ่าน|user|pass)\s*[:=]\s*\w+/i.test(response)) {
    return {
      isValid: false,
      reason: "พยายามให้ข้อมูล username/password",
      shouldEscalate: true,
    };
  }

  // 3. ห้ามระบุเบอร์โทรที่ดูเหมือนจริง (10 หลัก)
  if (/\b0\d{9}\b/.test(response)) {
    return {
      isValid: false,
      reason: "ระบุเบอร์โทรศัพท์ที่ไม่ได้ยืนยัน",
      shouldEscalate: true,
    };
  }

  // 4. ห้ามบอกเลขเด็ด/ทำนายเลข
  if (/(แนะนำเลข|เลขเด็ด|ลองเลข|เลขนี้|เลข.*แม่น|ฟันธง|เลขดัง)/i.test(response)) {
    return {
      isValid: false,
      reason: "พยายามแนะนำเลข/ทำนาย",
      shouldEscalate: true,
    };
  }

  // 5. ห้ามสร้างข้อมูลเปอร์เซ็นต์/อัตราจ่ายที่ไม่แน่ใจ
  if (/(จ่าย|ได้|โบนัส)\s*\d+\s*%/i.test(response) && !/โดยประมาณ|ราว|ประมาณ/i.test(response)) {
    return {
      isValid: false,
      reason: "ระบุเปอร์เซ็นต์แน่นอนโดยไม่มีคำว่า 'โดยประมาณ'",
      shouldEscalate: true,
    };
  }

  // 6. คำเตือน: คำตอบสั้นเกินไป (อาจเป็นข้อผิดพลาด)
  if (response.trim().length < 10) {
    return {
      isValid: false,
      reason: "คำตอบสั้นเกินไป",
      shouldEscalate: true,
    };
  }

  // 7. คำเตือน: คำตอบยาวเกินไป (อาจคุยเยิ่นเย้อ)
  if (response.length > 800) {
    return {
      isValid: false,
      reason: "คำตอบยาวเกินไป (>800 ตัวอักษร)",
      shouldEscalate: true,
    };
  }

  // ผ่านการตรวจสอบ
  return { isValid: true };
}

/**
 * ทำความสะอาดคำตอบ (ลบข้อความที่ไม่เหมาะสม)
 */
export function sanitizeResponse(response: string): string {
  let cleaned = response;

  // ลบเบอร์โทรที่ดูผิดปกติ (ยกเว้น LINE OA เช่น @mechoke)
  cleaned = cleaned.replace(/\b0\d{9}\b/g, "[เบอร์โทร - กรุณาติดต่อแอดมิน]");

  // ลบ email ที่ดูผิดปกติ
  cleaned = cleaned.replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, "[อีเมล]");

  return cleaned.trim();
}
