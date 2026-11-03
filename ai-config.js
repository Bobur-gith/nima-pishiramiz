// AI oshpaz sozlamasi.
//
// endpoint bo'sh bo'lsa: umumiy savollarga Puter.js orqali bepul AI javob beradi —
//   foydalanuvchi bir marta "AI'ni yoqish" tugmasini bosib, bepul Puter akkauntiga kiradi.
// O'z serveringiz bo'lsa (tools/ai-worker.js — Cloudflare Worker + Claude API kaliti),
//   uning manzilini endpoint ga yozing: shunda hech kimdan kirish so'ralmaydi.
//
// Retsept qidirish (masalliq, davlat, vaqt, sho'rva/quyuq, taom nomi) har doim AI'siz, ilovaning o'zida ishlaydi.
window.AI_CONFIG = {
  endpoint: "",
  models: ["anthropic/claude-haiku-5-5", "google/gemini-3.8-flash", "gpt-5.4-nano"]
};
