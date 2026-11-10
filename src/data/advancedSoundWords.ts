import type { SoundWord } from "../types/phonetics";

export const ADVANCED_SOUND_WORDS: SoundWord[] = [
  {
    word: "prerequisite",
    tokens: ["ˌ", "p", "r", "iː", "ˈ", "r", "e", "k", "w", "ɪ", "z", "ɪ", "t"],
    accepted: ["ˌpriːˈrekwɪzɪt"],
    hint: "Something that must be in place before you can do something else.",
    context: "Basic swimming ability is a prerequisite for this course.",
    note: "Place secondary stress on /priː/ and primary stress on /rek/. The written ‘qu’ becomes /kw/, and the later ‘s’ is /z/.",
    sourceUrl:
      "https://dictionary.cambridge.org/us/pronunciation/english/prerequisite",
  },
  {
    word: "monologue",
    tokens: ["ˈ", "m", "ɒ", "n", "ə", "l", "ɒ", "ɡ"],
    accepted: ["ˈmɒnəlɒɡ"],
    hint: "An extended speech by one person, including a solo part in a performance.",
    context:
      "The actor rehearsed her monologue before the rest of the cast arrived.",
    note: "Stress the first syllable. Both written o sounds are /ɒ/ here; the word ends in /ɡ/, with no extra vowel after it.",
    sourceUrl:
      "https://dictionary.cambridge.org/pronunciation/english/monologue",
  },
  {
    word: "suspicion",
    tokens: ["s", "ə", "ˈ", "s", "p", "ɪ", "ʃ", "ə", "n"],
    accepted: ["səˈspɪʃən"],
    hint: "A feeling that something may be true or wrong, without being sure.",
    context: "I had a suspicion that we had missed our stop.",
    note: "Stress /spɪʃ/. The first and last vowels are weak /ə/ sounds; the written ‘ci’ contributes /ʃ/.",
    sourceUrl:
      "https://dictionary.cambridge.org/pronunciation/english/suspicion",
  },
  {
    word: "lethal",
    tokens: ["ˈ", "l", "iː", "θ", "ə", "l"],
    accepted: ["ˈliːθəl"],
    hint: "Able to cause death.",
    context: "The warning described a potentially lethal hazard.",
    note: "Use /iː/ followed by unvoiced /θ/. Do not substitute /t/ or /s/ for the th sound; the final syllable is weak.",
    sourceUrl: "https://dictionary.cambridge.org/pronunciation/english/lethal",
  },
  {
    word: "venomous",
    tokens: ["ˈ", "v", "e", "n", "ə", "m", "ə", "s"],
    accepted: ["ˈvenəməs"],
    hint: "Able to deliver a toxic substance through a bite or sting.",
    context: "The guide explained which local snakes were venomous.",
    note: "Stress /ven/. The two following vowels are both /ə/, and the ending is /s/.",
    sourceUrl:
      "https://dictionary.cambridge.org/pronunciation/english/venomous",
  },
  {
    word: "poisonous",
    tokens: ["ˈ", "p", "ɔɪ", "z", "ə", "n", "ə", "s"],
    accepted: ["ˈpɔɪzənəs"],
    hint: "Containing a harmful substance that can make someone ill when taken into the body.",
    context: "The label warned that the berries were poisonous.",
    note: "The stressed vowel /ɔɪ/ is one moving sound. The middle consonant is voiced /z/, while the final consonant is /s/.",
    sourceUrl:
      "https://dictionary.cambridge.org/dictionary/learner-english/poisonous",
  },
];
