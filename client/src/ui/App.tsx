import { useEffect, useMemo, useState } from "react";
import { fetchNext, submitAnswer, type AnswerOk, type NextWord } from "./api";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "success"; result: AnswerOk }
  | { kind: "error"; message: string };

export function App() {
  const [word, setWord] = useState<NextWord | null>(null);
  const [answerBg, setAnswerBg] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const canSubmit = useMemo(() => !!word && !!answerBg.trim(), [word, answerBg]);

  async function loadNext() {
    setStatus({ kind: "loading" });
    setShowHint(false);
    setGaveUp(false);
    setAnswerBg("");
    try {
      const w = await fetchNext();
      setWord(w);
      setStatus({ kind: "ready" });
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Failed to load word." });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!word) return;

    try {
      const res = await submitAnswer(word.id, answerBg);
      if (res.correct) {
        setStatus({ kind: "success", result: res });
      } else {
        // valid request, wrong answer — allow retry
        setStatus({ kind: "error", message: res.message });
      }
    } catch (e) {
      // server-side validation failures (400), network errors, etc.
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Request failed." });
    }
  }

  useEffect(() => {
    void loadNext();
  }, []);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="title">German → Bulgarian</h1>
          <p className="subtitle">Type the Bulgarian translation. Use a hint if needed.</p>
        </div>
        <button className="btn secondary" onClick={loadNext} disabled={status.kind === "loading"}>
          New word
        </button>
      </header>

      <main className="card">
        {word ? (
          <>
            <div className="prompt">
              <div className="label">German</div>
              <div className="german">{word.german}</div>
            </div>

            <div className="row">
              <button className="btn tertiary" onClick={() => setShowHint((s) => !s)} disabled={!word}>
                {showHint ? "Hide hint" : "Hint (English)"}
              </button>
              {showHint ? <div className="hint">English: {word.english}</div> : <div className="hint muted"> </div>}
            </div>

            {status.kind === "success" ? (
              <div className="successBox" role="status">
                <div className="successTitle">Correct!</div>
                <div className="triplet">
                  <div>
                    <div className="smallLabel">German</div>
                    <div className="val">{status.result.german}</div>
                  </div>
                  <div>
                    <div className="smallLabel">English</div>
                    <div className="val">{status.result.english}</div>
                  </div>
                  <div>
                    <div className="smallLabel">Bulgarian</div>
                    <div className="val">{status.result.bulgarian}</div>
                  </div>
                </div>
                <button className="btn" onClick={loadNext}>
                  Next word
                </button>
              </div>
            ) : gaveUp ? (
              <div className="successBox" role="status">
                <div className="successTitle">Better luck next time!</div>
                <div className="triplet">
                  <div>
                    <div className="smallLabel">German</div>
                    <div className="val">{word.german}</div>
                  </div>
                  <div>
                    <div className="smallLabel">English</div>
                    <div className="val">{word.english}</div>
                  </div>
                  <div>
                    <div className="smallLabel">Bulgarian</div>
                    <div className="val">{word.bulgarian}</div>
                  </div>
                </div>
                <button className="btn" onClick={loadNext}>
                  Next word
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="form">
                <label className="label" htmlFor="answerBg">
                  Bulgarian translation
                </label>
                <input
                  id="answerBg"
                  className="input"
                  value={answerBg}
                  onChange={(e) => setAnswerBg(e.target.value)}
                  placeholder="Напр. къща"
                  autoComplete="off"
                  autoFocus
                />

                {status.kind === "error" ? (
                  <div className="error" role="alert">
                    {status.message}
                  </div>
                ) : null}

                <div className="actions">
                  <button className="btn" type="submit" disabled={!canSubmit || status.kind === "loading"}>
                    Check
                  </button>
                  <button className="btn secondary" type="button" onClick={() => setGaveUp(true)}>
                    Give up
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="loading">
            {status.kind === "error" ? (
              <>
                <div className="error" role="alert">
                  {status.message}
                </div>
                <div style={{ marginTop: 12 }}>
                  <button className="btn" onClick={loadNext}>
                    Retry
                  </button>
                </div>
              </>
            ) : (
              "Loading…"
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <span className="muted">Tip: answers are case-insensitive and trimmed.</span>
      </footer>
    </div>
  );
}

