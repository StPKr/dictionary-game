type MediaWikiRandomResponse = {
  query?: {
    random?: Array<{
      id: number;
      ns: number;
      title: string;
    }>;
  };
};

function isGoodTitle(title: string): boolean {
  const t = title.trim();
  if (!t) return false;
  if (t.includes(":")) return false;
  if (t.length > 24) return false;
  // Avoid obvious non-words / noisy titles (parentheses, slashes, punctuation).
  if (/[()[\]{}\\/.,;!?'"“”„]/.test(t)) return false;
  // Prefer single tokens (allow hyphen), including German letters.
  if (!/^[A-Za-zÄÖÜäöüß-]+$/.test(t)) return false;
  return true;
}

export async function getRandomGermanWordTitle(): Promise<string> {
  // de.wiktionary.org (German Wiktionary)
  const endpoint =
    "https://de.wiktionary.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*";

  let lastTitle = "";
  for (let i = 0; i < 12; i++) {
    const res = await fetch(endpoint, { method: "GET" });
    if (!res.ok) throw new Error(`Wiktionary error (HTTP ${res.status})`);

    const data = (await res.json()) as MediaWikiRandomResponse;
    const title = data.query?.random?.[0]?.title ?? "";
    lastTitle = title;
    if (isGoodTitle(title)) return title.trim();
  }

  throw new Error(`Could not find a good random word (last: "${lastTitle}").`);
}

