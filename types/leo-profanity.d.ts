declare module "leo-profanity" {
  const leoProfanity: {
    loadDictionary: () => void;
    add: (words: string[]) => void;
    check: (word: string) => boolean;
    clean: (text: string) => string;
    list: () => string[];
  };
  export default leoProfanity;
}
