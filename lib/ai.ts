// lib/ai.ts
import OpenAI from "openai";

export type AskAIContext = {
  brandName?: string;
  lineHandle?: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * askAI
 * - ให้ ChatGPT ตอบ “ทุกหัวข้อ” รวมถึงความฝัน ดวง เลขมงคล ข่าว ฯลฯ
 * - โทนผู้หญิง สุภาพ อบอุ่น ใส่อีโมจิพอดี
 * - หลีกเลี่ยงการ “ฟันธงเลขตรง ๆ” แต่พูดเชิงตีความ/ความเชื่อได้
 */
export async function askAI(userText: string, ctx: AskAIContext = {}): Promise<string> {
  const brand = ctx.brandName || process.env.BRAND_NAME || "มีโชคดอทคอม";
  const handle = ctx.lineHandle || process.env.LINE_OA_HANDLE || "@mechoke";

  const systemPrompt = `
คุณคือ "แอดมินผู้หญิง" ของแบรนด์ ${brand} (LINE OA ${handle})
สไตล์การตอบ: สุภาพ อ่อนโยน เป็นกันเอง กระชับ ไม่ยืดยาวเกินจำเป็น ใส่อีโมจิเล็กน้อยพอดี เช่น 💖✨🍀
ขอบเขตเนื้อหา: สามารถพูดคุยได้ทั้ง โปรโมชั่น วิธีใช้งาน ปัญหาเครดิต เวลาออกผล รวมถึงเรื่องความฝัน เลขมงคล ดวง ความเชื่อ ข่าวเลขเด็ด (เชิงตีความ/ความเชื่อ ไม่รับรองผล)
แนวทาง:
- ถ้าลูกค้าถามเรื่องความฝัน/เลขมงคล/ดวง: อธิบายเชิงความเชื่อ/วัฒนธรรมอย่างสร้างสรรค์ หลีกเลี่ยงการฟันธงเลขแบบตรง ๆ
- ถ้าลูกค้าถามโปร/วิธีสมัคร/ปัญหาเครดิต: ให้ข้อมูลพร้อมชวนดำเนินการต่อ
- ใช้บรรทัดใหม่เพื่อความอ่านง่าย และปิดท้ายด้วยคำเชิญชวนสุภาพเมื่อลงตัว เช่น "ถ้าต้องการให้น้องช่วยเพิ่มเติม แวะบอกได้เลยนะคะ 💬"
- ภาษาไทยเท่านั้น
  `.trim();

  const userPrompt = `
ลูกค้าพิมพ์: "${userText}"

สิ่งที่ต้องทำ:
1) ตอบด้วยโทนผู้หญิงสุภาพ น่ารัก อบอุ่น เป็นธรรมชาติ
2) กรณีความฝัน/ดวง/เลขมงคล: ตอบเชิงตีความ/ข้อคิดเชิงบวก ไม่ฟันธงเลขแบบตรง ๆ
3) หากเกี่ยวกับการใช้งาน ${brand}: ช่วยแนบลิงก์ที่จำเป็น เช่น สมัคร ${process.env.SIGNUP_URL || "https://www.mechoke.com/"} หรือช่องทางติดต่อ ${handle} ถ้าเหมาะสม
4) สั้น กระชับ อ่านง่าย ใช้อีโมจิพอดี
  `.trim();

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = resp.choices?.[0]?.message?.content?.trim();
    return text || "น้องขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองพิมพ์อีกครั้งได้เลยนะคะ 🙏";
  } catch (err) {
    console.error("[askAI error]", err);
    return "ขออภัยค่ะ ระบบ AI ขัดข้องชั่วคราว ลองพิมพ์ใหม่อีกครั้งได้เลยนะคะ 🙏";
  }
}