// "Nima pishiramiz?" AI oshpaz uchun o'z serveringiz (ixtiyoriy).
// Kerak bo'lganda: Cloudflare Workers'da yangi Worker yarating, shu kodni qo'ying,
// Settings → Variables'ga ANTHROPIC_API_KEY (maxfiy) qo'shing, so'ng Worker manzilini ai-config.js dagi endpoint ga yozing.
// Shunda foydalanuvchilardan Puter'ga kirish so'ralmaydi, AI xarajati sizning Claude API hisobingizdan bo'ladi.
const ORIGIN = "https://bobur-gith.github.io";
const MODEL = "claude-haiku-5-5";

export default {
  async fetch(req, env) {
    const cors = { "Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("POST only", { status: 405, headers: cors });
    let body; try { body = await req.json(); } catch { return new Response("bad json", { status: 400, headers: cors }); }
    const msgs = Array.isArray(body.messages) ? body.messages.slice(-14) : [];
    const system = msgs.filter(m => m.role === "system").map(m => String(m.content)).join("\n").slice(0, 6000);
    const messages = msgs.filter(m => m.role === "user" || m.role === "assistant").map(m => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
    while (messages.length && messages[0].role !== "user") messages.shift();
    if (!messages.length) return new Response("empty", { status: 400, headers: cors });
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, system, messages, stream: true })
    });
    if (!r.ok || !r.body) return new Response("upstream " + r.status, { status: 502, headers: cors });
    // Anthropic SSE -> plain text stream (only the text deltas)
    const { readable, writable } = new TransformStream();
    (async () => {
      const w = writable.getWriter(), enc = new TextEncoder(), dec = new TextDecoder(), rd = r.body.getReader();
      let buf = "";
      for (;;) {
        const { done, value } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        let i; while ((i = buf.indexOf("\n\n")) >= 0) {
          const ev = buf.slice(0, i); buf = buf.slice(i + 2);
          const line = ev.split("\n").find(l => l.startsWith("data: ")); if (!line) continue;
          try { const d = JSON.parse(line.slice(6)); if (d.type === "content_block_delta" && d.delta && d.delta.text) await w.write(enc.encode(d.delta.text)); } catch {}
        }
      }
      await w.close();
    })();
    return new Response(readable, { headers: { ...cors, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
};
