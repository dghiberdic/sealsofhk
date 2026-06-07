// ---------------------------------------------------------------------------
// Telegram carer alerts.
//
// The Telegram Bot API is a plain HTTPS endpoint that sends permissive CORS
// headers, so we can call it directly from the browser — no backend needed.
// The bot token is supplied by the user and kept in localStorage; like the
// Anthropic key it is therefore visible in the browser, so use a throwaway bot.
// A bot can only message someone who has already started a chat with it.
// ---------------------------------------------------------------------------

import type { WatchAssessment } from "./rules";

// Default bot config comes from env (VITE_TG_BOT_TOKEN / VITE_TG_CHAT_ID) — no
// secret is committed to the repo. The Settings fields override these per
// browser. Leave the env vars unset and the feature simply stays idle until a
// token + chat id are entered in Settings.
export const DEFAULT_TG_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN || "";
export const DEFAULT_TG_CHAT_ID = import.meta.env.VITE_TG_CHAT_ID || "";

export interface TelegramResult {
  ok: boolean;
  error?: string;
}

export async function sendTelegram(
  token: string,
  chatId: string,
  text: string,
): Promise<TelegramResult> {
  if (!token.trim() || !chatId.trim()) {
    return { ok: false, error: "Add your bot token and chat ID first." };
  }
  let res: Response;
  try {
    res = await fetch(
      `https://api.telegram.org/bot${token.trim()}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text,
          disable_web_page_preview: true,
        }),
      },
    );
  } catch {
    return { ok: false, error: "Couldn't reach Telegram — check your connection." };
  }
  if (!res.ok) {
    let desc = "";
    try {
      const j = (await res.json()) as { description?: string };
      desc = j.description ?? "";
    } catch {
      /* ignore */
    }
    if (res.status === 401) return { ok: false, error: "That bot token was rejected." };
    if (res.status === 400 && /chat not found/i.test(desc))
      return { ok: false, error: "Chat not found — the carer must message the bot once first." };
    return { ok: false, error: `Telegram rejected it (${res.status}). ${desc}`.trim() };
  }
  return { ok: true };
}

const RAG_WORD = {
  green: { zh: "一切正常", en: "All clear" },
  yellow: { zh: "建議覆診", en: "Worth a check-up" },
  red: { zh: "請致電醫生", en: "Please call the doctor" },
} as const;

// The bilingual carer alert — the same green/yellow/red message shown in-app,
// formatted for a chat.
export function carerAlertText(name: string, watch: WatchAssessment): string {
  const word = RAG_WORD[watch.status];
  return [
    `🫀 HeartSum — ${name}`,
    `${word.zh} / ${word.en}`,
    "",
    watch.caretaker.zh,
    "",
    watch.caretaker.en,
  ].join("\n");
}
