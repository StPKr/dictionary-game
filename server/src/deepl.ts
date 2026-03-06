type DeepLTranslateResponse = {
  translations: Array<{
    detected_source_language?: string;
    text: string;
  }>;
};

function deeplBaseUrl(): string {
  // Free plan uses api-free.deepl.com; paid uses api.deepl.com.
  // We default to free for this project.
  return "https://api-free.deepl.com/v2/translate";
}

export async function deeplTranslate(params: {
  authKey: string;
  text: string;
  sourceLang: "DE";
  targetLang: "EN" | "BG";
}): Promise<string> {
  const url = deeplBaseUrl();

  const body = new URLSearchParams();
  body.set("text", params.text);
  body.set("source_lang", params.sourceLang);
  body.set("target_lang", params.targetLang);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `DeepL-Auth-Key ${params.authKey}`
    },
    body
  });

  const txt = await res.text();
  if (!res.ok) {
    // DeepL returns JSON errors, but don’t assume.
    throw new Error(`DeepL error (HTTP ${res.status}): ${txt}`);
  }

  const data = JSON.parse(txt) as DeepLTranslateResponse;
  const out = data.translations?.[0]?.text ?? "";
  if (!out.trim()) throw new Error("DeepL returned empty translation.");
  return out;
}

