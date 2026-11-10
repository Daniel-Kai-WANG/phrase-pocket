import type { Theme } from "../types/learning";

export const SCENES: Record<
  Theme,
  { name: string; invitation: string; prompt: string; souvenir: string }
> = {
  "small-talk": {
    name: "Coffee Corner",
    invitation: "A familiar face. A fresh conversation.",
    prompt: "You bump into a neighbour. How would you start a chat?",
    souvenir: "Coffee break",
  },
  relationships: {
    name: "Riverside Walk",
    invitation: "Good conversations bring us closer.",
    prompt: "A friend wants to know how you feel. What would you tell them?",
    souvenir: "A little connection",
  },
  work: {
    name: "Idea Studio",
    invitation: "Big ideas start with a few good words.",
    prompt: "Your teammate asks how the project is going. What would you say?",
    souvenir: "Bright idea",
  },
  social: {
    name: "Rooftop Club",
    invitation: "Pull up a chair. You’re among friends.",
    prompt: "Your mates are making weekend plans. What would you suggest?",
    souvenir: "Good company",
  },
  feelings: {
    name: "Rainy Day Room",
    invitation: "A quiet place to find the right words.",
    prompt: "Someone asks how you’re really doing. How would you answer?",
    souvenir: "Room to breathe",
  },
  travel: {
    name: "Next Stop Station",
    invitation: "Pack a few phrases. See where they take you.",
    prompt: "You’ve just arrived somewhere new. What would you ask a local?",
    souvenir: "Going places",
  },
  slang: {
    name: "After Hours Arcade",
    invitation: "Play with words. Sound like yourself.",
    prompt: "A mate makes a ridiculous claim. How would you playfully respond?",
    souvenir: "Play it your way",
  },
};
