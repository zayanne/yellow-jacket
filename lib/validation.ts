import leoProfanity from "leo-profanity";

leoProfanity.loadDictionary();
leoProfanity.add(["thayoli"]); // custom words

// Censor individual words
export function censorWord(word: string) {
  if (word.length <= 2) return word;
  return word[0] + "*".repeat(word.length - 1);
}

// Normalize text for checking banned phrases
function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/\*/g, "") // remove asterisks
    .replace(/\s+/g, " ")
    .trim();
}

// Filter message
export function filterMessage(message: string): { allowed: boolean; output: string } {
  // Keep newlines while censoring
  const words = message.split(/(\s+)/); // <-- keeps spaces & newlines in array

  const bannedPhrases = ["fuck you", "shit you"];
  const normalized = normalizeText(message);

  const isBlocked = bannedPhrases.some((phrase) => normalized.includes(phrase));

  // Censor bad words but keep whitespace/newlines untouched
  const filtered = words.map((word) =>
    leoProfanity.check(word.trim()) ? censorWord(word.trim()) + word.slice(word.trim().length) : word
  );

  return {
    allowed: !isBlocked,
    output: filtered.join(""), // join without collapsing whitespace
  };
}

