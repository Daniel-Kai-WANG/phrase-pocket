import type { SoundHelp } from "../types/phonetics";

export const SOCIAL_SOUND_HELP: Record<string, SoundHelp> = {
  genuine: {
    hints: [
      "Authentic rather than an imitation, or honestly felt rather than pretended.",
      "Real in origin, or honest when describing a feeling.",
      "Exactly what it appears to be, rather than something made to fool you.",
      "Truly felt or real, rather than copied or acted.",
      "A thing is real, or a person really feels what they show.",
      "Real, not fake or pretended.",
    ],
    examples: [
      "Her smile was genuine; she was pleased to see us.",
      "Is this a genuine painting or a copy?",
    ],
  },
  sincere: {
    hints: [
      "Expressing feelings or beliefs that are honestly held.",
      "Truly meaning what you say, without pretending.",
      "Speaking from your real feelings rather than trying to impress someone.",
      "Saying something because you really believe or feel it.",
      "Your words match how you really feel.",
      "You really mean what you say.",
    ],
    examples: [
      "He offered a sincere apology for being late.",
      "My thanks are sincere. Your help meant a lot.",
    ],
  },
  jealous: {
    hints: [
      "Feeling unhappy about a rival, or wanting an advantage that someone else has.",
      "Upset that another person has something you want, or may take away affection you value.",
      "Wishing you had what someone else has, or worrying about a rival in love.",
      "Unhappy about another person getting something or someone you want.",
      "You want their good fortune, or fear losing someone you love to them.",
      "You wish you had what they have, or worry your partner likes someone else.",
    ],
    examples: [
      "I'm jealous of your lovely garden.",
      "He felt jealous when his partner flirted with someone else.",
    ],
  },
  exclusive: {
    hints: [
      "Restricted to particular people; in dating, involving no other partners.",
      "Available to a limited group, or agreed to be only between two partners.",
      "Kept for certain people rather than open to everyone.",
      "Only for the people included; in a relationship, neither person dates anyone else.",
      "Shared only within a chosen group or between two partners.",
      "Only for certain people; in dating, only seeing each other.",
    ],
    examples: [
      "They are exclusive now; neither is dating anyone else.",
      "Members get exclusive access to the pool.",
    ],
  },
  cheeky: {
    hints: [
      "Slightly disrespectful or boldly playful, sometimes in an amusing way.",
      "Behaving with a little more boldness than politeness normally allows.",
      "A bit rude or daring, often with a playful attitude.",
      "Saying or doing something bold that might make people laugh.",
      "A little rude, but sometimes funny rather than hurtful.",
      "A bit rude or bold in a playful way.",
    ],
    examples: [
      "He gave me a cheeky grin and took the last chip.",
      "That was a cheeky question to ask your boss!",
    ],
  },
  stubborn: {
    hints: [
      "Unwilling to change an opinion or decision despite persuasion.",
      "Refusing to reconsider what you have decided.",
      "Continuing your own way even when others suggest a change.",
      "Holding on to your choice despite reasons to change it.",
      "Not wanting to change your mind when people ask you to.",
      "You refuse to change your mind.",
    ],
    examples: [
      "Don't be stubborn; let someone help you.",
      "She was too stubborn to admit she was wrong.",
    ],
  },
  sarcastic: {
    hints: [
      "Using remarks that mock or criticise through irony.",
      "Saying something with a meaning different from the literal words to show annoyance or ridicule.",
      "Often saying the opposite of what you mean to make a critical joke.",
      "Using words that sound positive while your tone makes a negative meaning clear.",
      "Saying something you do not really mean to make fun of a person or situation.",
      "You say one thing but mean something different to tease or criticise.",
    ],
    examples: [
      "‘Lovely weather,’ he said in a sarcastic voice as rain soaked his shoes.",
      "Her sarcastic ‘Well done’ showed that she was annoyed by the mistake.",
    ],
  },
  pessimistic: {
    hints: [
      "Expecting unfavourable outcomes rather than favourable ones.",
      "Tending to believe that events will turn out badly.",
      "Looking ahead with little hope of a good result.",
      "Focusing on what is likely to go wrong.",
      "Thinking that bad things will probably happen.",
      "You think things will go badly.",
    ],
    examples: [
      "He is pessimistic about finding his lost phone.",
      "Don't be so pessimistic; we still have a chance.",
    ],
  },
};
