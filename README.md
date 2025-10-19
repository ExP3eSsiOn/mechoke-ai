your-app/
├─ app/
│  └─ api/
│     └─ line/
│        └─ webhook/
│           └─ route.ts          # Webhook หลัก (TypeScript)
├─ lib/
│  ├─ line.ts                    # call LINE reply/push + verify signature
│  └─ ai.ts                      # call OpenAI + system prompt
├─ package.json
├─ .env.local                    # เก็บคีย์ลับ (local dev)
└─ README.md