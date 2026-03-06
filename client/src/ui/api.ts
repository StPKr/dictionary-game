export type NextWord = {
  id: string;
  german: string;
  english: string;
  bulgarian: string;
};

export type AnswerOk = {
  correct: true;
  german: string;
  english: string;
  bulgarian: string;
};

export type AnswerFail = {
  correct: false;
  message: string;
};

export type AnswerResponse = AnswerOk | AnswerFail;

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    // If server ever returns non-JSON, surface it.
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function fetchNext(): Promise<NextWord> {
  const res = await fetch("/api/next");
  if (!res.ok) throw new Error(`Failed to fetch next word (HTTP ${res.status})`);
  return readJson<NextWord>(res);
}

export async function submitAnswer(id: string, answerBg: string): Promise<AnswerResponse> {
  const res = await fetch("/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, answerBg })
  });

  // NOTE: Wrong answers are expected to be HTTP 200 with correct:false.
  // Only malformed requests should be 4xx/5xx.
  const data = await readJson<AnswerResponse>(res);
  if (!res.ok) {
    // Still return the message if present, but surface as an error to caller.
    const msg = (data as AnswerFail | undefined)?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

