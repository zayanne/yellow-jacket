import leoProfanity from "leo-profanity";

leoProfanity.loadDictionary();
leoProfanity.add(["oke"]); // custom words

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
  const words = message.split(/\s+/);

  // Check banned phrases (even partially censored)
  const bannedPhrases = ["fuck you", "shit you"];
  const normalized = normalizeText(message);

  const isBlocked = bannedPhrases.some((phrase) => normalized.includes(phrase));

  // Censor individual bad words
  const filtered = words.map((word) => (leoProfanity.check(word) ? censorWord(word) : word));

  return {
    allowed: !isBlocked,
    output: filtered.join(" "),
  };
}
