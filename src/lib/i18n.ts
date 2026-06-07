import { useStore } from "./store";
import type { Lang } from "./types";

// ---------------------------------------------------------------------------
// Bilingual UI strings — English + Traditional Chinese (Hong Kong, 繁體).
// Use `const { t } = useT()` and `t("key")`. For the always-bilingual doctor
// report, use STR[key] directly to render the zh line then the en line.
// ---------------------------------------------------------------------------

type Pair = { en: string; zh: string };

export const STR = {
  // language toggle
  "lang.toggle": { en: "中文", zh: "EN" },
  "lang.name": { en: "English", zh: "繁體中文" },

  // nav
  "nav.today": { en: "Today", zh: "今日" },
  "nav.signals": { en: "Signals", zh: "訊號" },
  "nav.more": { en: "More info", zh: "更多資訊" },
  "nav.ask": { en: "Ask your doctor", zh: "問醫生" },
  "nav.report": { en: "Doctor report", zh: "醫生報告" },
  "nav.settings": { en: "Settings", zh: "設定" },
  "nav.footer": {
    en: "Wellness signals, not a diagnosis. A bridge to your doctor — never a replacement.",
    zh: "健康訊號，並非診斷。協助你與醫生溝通，不能取代醫生。",
  },

  // common
  "common.continue": { en: "Continue", zh: "繼續" },
  "common.signalNote": {
    en: "These are wellness signals, not a diagnosis. HeartSum never tells you to start, stop, or change any medication or treatment.",
    zh: "這些是健康訊號，並非診斷。HeartSum 不會叫你開始、停止或更改任何藥物或治療。",
  },

  // welcome
  "welcome.h1": { en: "A calm look at your health, every morning.", zh: "每朝平靜地了解你的健康。" },
  "welcome.intro": {
    en: "HeartSum gathers the numbers from your Apple Watch and your blood tests into one easy place. It learns what's normal for you, gently points out anything worth noticing, and gets you ready for your doctor — all in plain English.",
    zh: "HeartSum 把你 Apple Watch 的數據和驗血結果整合到一個簡單的地方。它學習你的「正常」基線，溫和地提示值得留意的地方，並幫你準備好見醫生——全部用淺白的文字。",
  },
  "welcome.isTitle": { en: "What HeartSum is", zh: "HeartSum 是甚麼" },
  "welcome.isBody": {
    en: "An early-warning helper and a bridge to your doctor. Most days it'll simply tell you you're steady. Now and then, it'll gently flag something worth a look.",
    zh: "一個及早預警的小幫手，也是你與醫生之間的橋樑。大部分日子它只會告訴你一切平穩；偶爾它會溫和地提示值得留意的地方。",
  },
  "welcome.isntTitle": { en: "What it isn't", zh: "它不是甚麼" },
  "welcome.isntBody": {
    en: "It is not a diagnosis, and it will never tell you to start, stop, or change any medication or treatment. That's always a conversation for you and a real clinician.",
    zh: "它不是診斷，亦永遠不會叫你開始、停止或更改任何藥物或治療。這些永遠是你與真正醫生之間的事。",
  },
  "welcome.start": { en: "Get started", zh: "開始" },
  "welcome.carer": { en: "I'm helping a family member set this up", zh: "我在幫家人設定" },

  // connect
  "connect.step": { en: "Step 2 of 2", zh: "第 2 步，共 2 步" },
  "connect.h1": { en: "Bring in your data", zh: "匯入你的數據" },
  "connect.intro": {
    en: "Upload what you have — each piece makes the picture richer. It's all optional, and you can add more any time.",
    zh: "上載你手上有的資料——每一項都讓畫面更完整。全部都是選擇性的，你隨時可以再加。",
  },
  "connect.watchTitle": { en: "Connect your Apple Watch & Health", zh: "連接你的 Apple Watch 及健康資料" },
  "connect.watchBody": {
    en: "Export your health data and upload the watch CSVs — resting & walking heart rate, HRV, blood oxygen, ECG, steps. They're read on your device and become your trends and alerts.",
    zh: "匯出你的健康數據，並上載手錶的 CSV 檔案——靜止及步行心率、心率變異、血氧、心電圖、步數。它們會在你的裝置上讀取，成為你的趨勢和提示。",
  },
  "connect.bloodTitle": { en: "Add your blood results", zh: "加入你的驗血結果" },
  "connect.bloodBody": {
    en: "This is where HeartSum goes beyond the watch — your watch can't measure cholesterol, blood sugar or inflammation.",
    zh: "這是 HeartSum 超越手錶的地方——手錶量不到膽固醇、血糖或發炎指數。",
  },
  "connect.bloodBtn": { en: "Photograph a lab report", zh: "拍攝化驗報告" },
  "connect.ehealthTitle": { en: "Link your eHealth record", zh: "連結你的醫健通記錄" },
  "connect.ehealthBody": {
    en: "Your conditions, medications and allergies. In production this comes from Hong Kong's eHealth record (eHRSS, Cap. 625) with your consent; for now, upload your medical summary and Claude reads it in.",
    zh: "你的病歷、藥物及過敏資料。正式版本會在你同意下，從香港醫健通（電子健康紀錄互通系統，第 625 章）取得；現階段請上載你的醫療摘要，由 Claude 讀取。",
  },
  "connect.go": { en: "Go to my dashboard", zh: "前往我的概覽" },

  // today
  "today.steady": { en: "Everything looks steady today.", zh: "今日一切看來平穩。" },
  "today.watch": { en: "Mostly steady — a couple of small things to keep an eye on.", zh: "大致平穩——有幾項小事值得留意。" },
  "today.look": { en: "Mostly steady — one thing is worth a closer look.", zh: "大致平穩——有一項值得仔細看看。" },
  "today.subSteady": {
    en: "I looked across your heart, sleep and activity this morning. Everything is sitting comfortably in your normal range — nothing to do today, enjoy your morning tea.",
    zh: "今早我看過你的心臟、睡眠和活動。一切都舒適地處於你的正常範圍——今日無需做甚麼，好好享受你的早茶。",
  },
  "today.subFlag": {
    en: "Most of your signals are calm. A few longer-term patterns are worth a glance — none of them is an emergency, and there's no rush. You'll find them under Signals.",
    zh: "你大部分訊號都很平靜。有幾項較長期的趨勢值得一看——都不是緊急情況，亦不用急。你可以在「訊號」中找到它們。",
  },
  "today.glance": { en: "Today at a glance", zh: "今日概覽" },
  "today.glanceIntro": {
    en: "Here's what your watch noticed overnight and so far today, with a plain word on what each one means. These are just today's readings — the bigger patterns over weeks live under Signals.",
    zh: "以下是你的手錶在過夜及今日所留意到的，並附上每項的淺白解釋。這些只是今日的讀數——數週的較大趨勢可在「訊號」中查看。",
  },
  "today.seePatterns": { en: "See the patterns worth a closer look", zh: "查看值得仔細看的趨勢" },
  "today.aroundUsual": { en: "Right around your usual", zh: "貼近你的平常水平" },
  "today.higherGood": { en: "A little higher than usual — nicely so", zh: "比平常稍高——是好事" },
  "today.lowerGood": { en: "A little lower than usual — nicely so", zh: "比平常稍低——是好事" },
  "today.higherWatch": { en: "A touch higher than usual", zh: "比平常稍高一點" },
  "today.lowerWatch": { en: "A touch lower than usual", zh: "比平常稍低一點" },

  // today readings
  "r.sleep": { en: "Last night's sleep", zh: "昨晚睡眠" },
  "r.sleep.plain": { en: "A blend of how long, how soundly and how steadily you slept.", zh: "綜合你睡得多久、多深和多穩定。" },
  "r.rhr": { en: "Resting heart rate", zh: "靜止心率" },
  "r.rhr.plain": { en: "Your heart's pace while you're completely at rest — a calm heart sits low here.", zh: "你完全休息時的心跳速度——平靜的心臟數值較低。" },
  "r.hrv": { en: "Heart-rate variability", zh: "心率變異" },
  "r.hrv.plain": { en: "The tiny timing gaps between beats. More variation usually means you're well rested.", zh: "心跳之間的微細時間差。變異越多，通常代表你休息得越好。" },
  "r.rr": { en: "Breathing rate", zh: "呼吸率" },
  "r.rr.plain": { en: "Your breaths per minute while you slept — reassuringly steady night to night.", zh: "你睡覺時每分鐘的呼吸次數——每晚穩定就令人安心。" },
  "r.spo2": { en: "Blood oxygen", zh: "血氧" },
  "r.spo2.plain": { en: "How well your blood carried oxygen overnight. Anywhere in the high 90s is comfortable.", zh: "你過夜時血液攜氧的程度。維持在 90 多就很舒適。" },
  "r.steps": { en: "Movement today", zh: "今日活動" },
  "r.steps.plain": { en: "How much you've been on your feet so far today.", zh: "你今日到目前為止活動了多少。" },

  // signals
  "signals.h1": { en: "Your signals", zh: "你的訊號" },
  "signals.intro": {
    en: "The patterns worth a closer look, and the ones sitting comfortably. Each is judged against your own normal — never a universal ideal.",
    zh: "值得仔細看的趨勢，以及處於舒適範圍的項目。每項都以你自己的正常基線判斷——並非一套通用標準。",
  },
  "signals.heart": { en: "Heart & circulation", zh: "心臟及血液循環" },
  "signals.metabolic": { en: "Metabolic & longevity", zh: "代謝及長壽" },
  "signals.secondary": { en: "Also keeping an eye on", zh: "其他持續留意的項目" },

  // ask
  "ask.h1": { en: "What to ask your doctor", zh: "可以問醫生的事" },
  "ask.intro": {
    en: "These questions come from your own flagged signals and blood work — specific, plain, and ready for the room. Tick the ones you want to raise, add your own, and they'll all flow into your doctor report.",
    zh: "這些問題來自你自己被標示的訊號和驗血——具體、淺白、可即時使用。剔選你想提出的，亦可自行加入，全部都會收進你的醫生報告。",
  },
  "ask.add": { en: "Add your own question", zh: "加入你自己的問題" },
  "ask.addBtn": { en: "Add", zh: "加入" },
  "ask.build": { en: "Build the report", zh: "製作報告" },
  "ask.seeWhy": { en: "see why", zh: "看原因" },

  // settings
  "settings.h1": { en: "Settings & privacy", zh: "設定與私隱" },
  "settings.intro": {
    en: "Your data is yours. You control everything here — sharing, helpers, export and deletion.",
    zh: "你的數據屬於你。這裡的一切由你控制——分享、協助者、匯出和刪除。",
  },
  "settings.language": { en: "Language", zh: "語言" },
  "settings.languageBody": { en: "Switch the whole app between English and Traditional Chinese.", zh: "整個應用程式在英文與繁體中文之間切換。" },
  "settings.connected": { en: "Connected data", zh: "已連接的數據" },
  "settings.watch": { en: "Apple Watch & Health", zh: "Apple Watch 及健康資料" },
  "settings.connected.yes": { en: "Connected", zh: "已連接" },
  "settings.connected.no": { en: "Not connected", zh: "未連接" },
  "settings.blood": { en: "Blood results", zh: "驗血結果" },
  "settings.onFile": { en: "on file", zh: "已存檔" },
  "settings.carer": { en: "Family / carer access", zh: "家人／照顧者存取" },
  "settings.carerBody": {
    en: "Let someone you trust help out or view your dashboard. You grant this, and you can remove it any time.",
    zh: "讓你信任的人協助或查看你的概覽。由你授權，亦可隨時取消。",
  },
  "settings.grant": { en: "Grant access", zh: "授予存取" },
  "settings.remove": { en: "Remove access", zh: "取消存取" },
  "settings.appearance": { en: "Appearance", zh: "外觀" },
  "settings.dark": { en: "Gentle dark mode", zh: "柔和深色模式" },
  "settings.darkBody": { en: "Warm and dim for evening reading.", zh: "溫暖而柔和，適合晚間閱讀。" },
  "settings.control": { en: "Your data, your control", zh: "你的數據，你話事" },
  "settings.export": { en: "Export everything", zh: "匯出全部" },
  "settings.delete": { en: "Delete all my data", zh: "刪除我的所有數據" },
  "settings.deleteConfirm": {
    en: "This will delete all your HeartSum data on this device and return you to the start. Continue?",
    zh: "這會刪除此裝置上所有 HeartSum 數據，並返回開始頁。要繼續嗎？",
  },
  "settings.region": {
    en: "Regulatory clearances and feature availability differ by country and region, so HeartSum describes signals carefully and avoids over-claiming.",
    zh: "監管批核及功能供應因國家及地區而異，所以 HeartSum 會謹慎描述各項訊號，避免誇大。",
  },

  // report (chrome — the report body itself is always bilingual)
  "report.h1": { en: "Your doctor report", zh: "你的醫生報告" },
  "report.intro": {
    en: "One clean page that makes your visit faster — what changed, what you'd like reviewed, and the questions you want to ask. Shown in Chinese and English.",
    zh: "一頁清晰的摘要，讓你的求診更快——有甚麼改變、想覆檢甚麼、想問甚麼。中英對照顯示。",
  },
  "report.print": { en: "Download / print as PDF", zh: "下載／列印為 PDF" },
  "report.link": { en: "Create a shareable link", zh: "建立分享連結" },
  "report.exportFhir": { en: "Export FHIR bundle", zh: "匯出 FHIR 檔案" },

  // profile
  "profile.step": { en: "Step 1 of 2", zh: "第 1 步，共 2 步" },
  "profile.h1": { en: "A little about you", zh: "關於你" },
  "profile.intro": {
    en: "This helps us read your numbers the way they apply to you. Nothing here is required, and you can change it any time. It's not a medical form — just a friendly hello.",
    zh: "這幫助我們以適用於你的方式解讀你的數字。這裡沒有任何必填項目，你隨時可以更改。這不是醫療表格——只是友善地打個招呼。",
  },
  "profile.name": { en: "What should we call you?", zh: "我們可以怎樣稱呼你？" },
  "profile.namePlaceholder": { en: "Your name", zh: "你的名字" },
  "profile.age": { en: "Age", zh: "年齡" },
  "profile.sex": { en: "Sex", zh: "性別" },
  "profile.sex.female": { en: "Female", zh: "女" },
  "profile.sex.male": { en: "Male", zh: "男" },
  "profile.sex.other": { en: "Other / prefer not to say", zh: "其他／不願透露" },
  "profile.height": { en: "Height (cm)", zh: "身高（厘米）" },
  "profile.weight": { en: "Weight (kg)", zh: "體重（公斤）" },
  "profile.commaHint": { en: "— separate with commas", zh: "——以逗號分隔" },
  "profile.conditions": { en: "Known conditions", zh: "已知病歷" },
  "profile.conditionsHint": { en: "Helps us know which signals matter most for you.", zh: "幫助我們知道哪些訊號對你最重要。" },
  "profile.conditionsPlaceholder": { en: "e.g. borderline high blood pressure", zh: "例如：邊緣性高血壓" },
  "profile.meds": { en: "Current medications", zh: "現時服用的藥物" },
  "profile.medsHint": { en: "We only use this for your doctor report. We'll never suggest changing anything.", zh: "我們只會在你的醫生報告中使用。我們永遠不會建議更改任何東西。" },
  "profile.medsPlaceholder": { en: "e.g. none, or list them", zh: "例如：沒有，或逐一列出" },
  "profile.family": { en: "Family history", zh: "家族病史" },
  "profile.familySub": { en: "— especially heart & metabolic", zh: "——尤其心臟及代謝" },
  "profile.familyHint": { en: "Family heart history helps us know which numbers to watch closely.", zh: "家族心臟病史幫助我們知道要密切留意哪些數字。" },
  "profile.familyPlaceholder": { en: "e.g. father — heart disease", zh: "例如：父親——心臟病" },
  "profile.smoking": { en: "Smoking", zh: "吸煙" },
  "profile.smoking.never": { en: "Never smoked", zh: "從不吸煙" },
  "profile.smoking.former": { en: "Former smoker", zh: "曾經吸煙" },
  "profile.smoking.current": { en: "Current smoker", zh: "現時吸煙" },
  "profile.activity": { en: "Activity level", zh: "活動量" },
  "profile.activity.low": { en: "Mostly resting", zh: "大多休息" },
  "profile.activity.moderate": { en: "Moderately active", zh: "中等活躍" },
  "profile.activity.high": { en: "Very active", zh: "非常活躍" },
  "profile.allergies": { en: "Allergies", zh: "過敏" },
  "profile.allergiesHint": { en: "Shown on your doctor report as safety context — never used for advice.", zh: "在你的醫生報告中作為安全資訊顯示——不會用於建議。" },
  "profile.allergiesPlaceholder": { en: "e.g. penicillin", zh: "例如：青黴素" },
  "profile.health": { en: "A few health questions", zh: "幾條健康問題" },
  "profile.healthHint": { en: "These help us estimate your 10-year heart risk accurately. Tick any that apply.", zh: "這些幫助我們準確估算你的十年心臟風險。請剔選適用的項目。" },
  "profile.q.onBpMeds": { en: "I take blood-pressure medication", zh: "我有服用血壓藥" },
  "profile.q.diabetes": { en: "I have been diagnosed with diabetes", zh: "我曾被診斷患有糖尿病" },
  "profile.q.priorStroke": { en: "I have had a stroke or mini-stroke (TIA)", zh: "我曾中風或短暫性腦缺血（小中風）" },
  "profile.q.priorHeartFailure": { en: "I have a heart-failure diagnosis", zh: "我有心臟衰竭的診斷" },
  "profile.q.knownVascularDisease": { en: "I have known vascular disease", zh: "我有已知的血管疾病" },
  "profile.continue": { en: "Continue", zh: "繼續" },

  // settings — Telegram carer alerts
  "settings.tg.title": { en: "Carer alerts (Telegram)", zh: "照顧者提示（Telegram）" },
  "settings.tg.body": {
    en: "Send the green / yellow / red caretaker alert to a family member's Telegram when something needs attention.",
    zh: "當有需要留意的情況時，把綠／黃／紅照顧者提示傳送到家人的 Telegram。",
  },
  "settings.tg.token": { en: "Bot token", zh: "機械人權杖 (Bot token)" },
  "settings.tg.chatId": { en: "Carer's chat ID", zh: "照顧者的 chat ID" },
  "settings.tg.auto": {
    en: "Auto-send when a yellow or red alert is detected",
    zh: "偵測到黃色或紅色警示時自動傳送",
  },
  "settings.tg.test": { en: "Send a test message", zh: "傳送測試訊息" },
  "settings.tg.sent": { en: "Sent ✓", zh: "已傳送 ✓" },
  "settings.tg.help": {
    en: "Create a bot with @BotFather to get a token. The carer must message your bot once so it's allowed to reach them.",
    zh: "用 @BotFather 建立機械人以取得權杖。照顧者須先向你的機械人發一則訊息，機械人才能聯絡他們。",
  },
} as const satisfies Record<string, Pair>;

export type StrKey = keyof typeof STR;

// Traditional-Chinese biomarker names for the bilingual report.
export const BIOMARKER_ZH: Record<string, string> = {
  totalChol: "總膽固醇",
  hdl: "高密度膽固醇 (HDL)",
  ldl: "低密度膽固醇 (LDL)",
  trig: "三酸甘油脂",
  apob: "載脂蛋白 B (ApoB)",
  glucose: "空腹血糖",
  hba1c: "糖化血紅素 (HbA1c)",
  crp: "高敏 C 反應蛋白 (hs-CRP)",
  systolic: "收縮壓",
  diastolic: "舒張壓",
};

export function useT() {
  const { lang } = useStore();
  const t = (k: StrKey): string => STR[k][lang];
  return { t, lang };
}

export function htmlLang(lang: Lang): string {
  return lang === "zh" ? "zh-Hant" : "en";
}
