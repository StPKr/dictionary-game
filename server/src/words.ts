export type WordEntry = {
  id: string;
  german: string;
  english: string;
  bulgarian: string;
};

// Tiny starter set. Add as many as you like.
export const WORDS: WordEntry[] = [
  { id: "1", german: "das Haus", english: "house", bulgarian: "къща" },
  { id: "2", german: "der Hund", english: "dog", bulgarian: "куче" },
  { id: "3", german: "die Katze", english: "cat", bulgarian: "котка" },
  { id: "4", german: "das Buch", english: "book", bulgarian: "книга" },
  { id: "5", german: "das Wasser", english: "water", bulgarian: "вода" },
  { id: "6", german: "die Schule", english: "school", bulgarian: "училище" }
];

export function normalizeBg(s: string): string {
  return s.trim().toLowerCase();
}

export function pickRandomWord(): WordEntry {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function findById(id: string): WordEntry | undefined {
  return WORDS.find((w) => w.id === id);
}

