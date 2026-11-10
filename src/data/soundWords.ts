import type { SoundWord } from "../types/phonetics";
import { SOCIAL_SOUND_WORDS } from "./socialSoundWords";
import { ADVANCED_SOUND_WORDS } from "./advancedSoundWords";

export const SOUND_WORDS: SoundWord[] = [
  {
    word: "vain",
    tokens: ["v", "eɪ", "n"],
    accepted: ["veɪn"],
    hint: "Without achieving the result you wanted, in the phrase ‘in …’.",
    context: "We searched for the missing keys in vain.",
    note: "The vowel /eɪ/ is one moving vowel sound. ‘Vein’ and ‘vane’ sound the same; the meaning tells you which spelling fits.",
    sourceUrl: "https://dictionary.cambridge.org/pronunciation/english/vain",
  },
  {
    word: "versatile",
    tokens: ["ˈ", "v", "ɜː", "s", "ə", "t", "aɪ", "l"],
    accepted: ["ˈvɜːsətaɪl"],
    hint: "Able to do many different jobs or be useful in many situations.",
    context: "A versatile tool can handle several jobs around the house.",
    note: "The first syllable carries the stress. This UK reference ends in /taɪl/; American dictionary forms often have a different final vowel.",
    sourceUrl:
      "https://dictionary.cambridge.org/pronunciation/english/versatile",
  },
  {
    word: "head",
    tokens: ["h", "e", "d"],
    accepted: ["hed", "hɛd"],
    hint: "The body part above your neck, or a word for a leader or moving towards a place.",
    context: "Let's head towards the station before it gets dark.",
    note: "Here ‘ea’ represents /e/, not /iː/. Some dictionaries write the same reference vowel as /ɛ/.",
    sourceUrl:
      "https://www.cambridgeenglish.org/Images/581165-b2-first-for-schools-preparing-for-exam-success-self-study-reading-activities-part-1.pdf",
  },
  {
    word: "comfort",
    tokens: ["ˈ", "k", "ʌ", "m", "f", "ə", "t"],
    accepted: ["ˈkʌmfət"],
    hint: "Help someone feel less upset or distressed.",
    context: "I tried to comfort my friend after a difficult day.",
    note: "Put primary stress before the first syllable. The second vowel is the weak /ə/ sound.",
    sourceUrl:
      "https://dictionary.cambridge.org/us/pronunciation/english/comfort",
  },
  {
    word: "reassure",
    tokens: ["ˌ", "r", "iː", "ə", "ˈ", "ʃ", "ɔː"],
    accepted: ["ˌriːəˈʃɔː"],
    hint: "Help someone feel less worried by giving them confidence.",
    context: "Can you reassure me that we still have enough time?",
    note: "Use secondary stress /ˌ/ first and primary stress /ˈ/ before /ʃɔː/. This is the UK reference form in isolation; a linking r may appear before a vowel.",
    sourceUrl:
      "https://dictionary.cambridge.org/us/pronunciation/english/reassure",
  },
  ...SOCIAL_SOUND_WORDS,
  ...ADVANCED_SOUND_WORDS,
];
