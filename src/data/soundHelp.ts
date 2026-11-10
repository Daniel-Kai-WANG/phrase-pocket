export interface SoundHelp {
  hints: string[];
  examples: string[];
}

export const SOUND_HELP: Record<string, SoundHelp> = {
  vain: {
    hints: [
      "You tried, but did not get the result you wanted.",
      "You looked everywhere for your keys, but still could not find them. Your search did not work.",
      "Your effort did not work. Use this word after ‘in’.",
    ],
    examples: [
      "I waited in vain for the bus. It never came.",
      "She tried in vain to fix the lamp. It still would not turn on.",
    ],
  },
  versatile: {
    hints: [
      "Useful for many different things.",
      "One person can cook, paint and repair bikes. They have many different skills.",
    ],
    examples: [
      "This versatile jacket works for both hiking and everyday wear.",
      "She is a versatile musician who plays several instruments.",
    ],
  },
  head: {
    hints: [
      "Your eyes and ears are on this body part. The same word can also mean a leader or ‘go towards’.",
      "In ‘Let's ___ home’, it means ‘go’. In ‘the ___ of the team’, it means ‘leader’.",
    ],
    examples: [
      "Body part: Put a hat on your head.",
      "Leader: She is the head of the team.",
      "Movement: Let's head home before it rains.",
    ],
  },
  comfort: {
    hints: [
      "Help someone feel better when they are sad.",
      "Your friend is crying. You sit with them and listen so they feel less alone.",
    ],
    examples: [
      "A hug can comfort a child who is upset.",
      "She stayed to comfort her friend after the bad news.",
    ],
  },
  reassure: {
    hints: [
      "Help someone worry less.",
      "Your friend is nervous. You say, ‘We have enough time. We won't be late.’",
    ],
    examples: [
      "Please reassure him that his dog is safe.",
      "The teacher tried to reassure us before the exam.",
    ],
  },
  genuine: {
    hints: [
      "Real, not fake.",
      "Someone smiles because they really feel happy. They are not pretending.",
    ],
    examples: [
      "Her smile was genuine; she was pleased to see us.",
      "Is this a genuine painting or a copy?",
    ],
  },
  sincere: {
    hints: [
      "You really mean what you say.",
      "You say sorry because you truly feel sorry, not just to end an argument.",
    ],
    examples: [
      "He offered a sincere apology for being late.",
      "My thanks are sincere. Your help meant a lot.",
    ],
  },
  jealous: {
    hints: [
      "You wish you had something another person has.",
      "Your friend has a month off. You wish you had that much time off too.",
    ],
    examples: [
      "I'm jealous of your lovely garden.",
      "He felt jealous when his partner flirted with someone else.",
    ],
  },
  exclusive: {
    hints: [
      "Only for certain people, not everyone.",
      "In dating, two people agree that they will not date anyone else.",
    ],
    examples: [
      "They are exclusive now; neither is dating anyone else.",
      "Members get exclusive access to the pool.",
    ],
  },
  cheeky: {
    hints: [
      "A little rude or bold, but sometimes funny.",
      "A child asks for your cake with a big grin, even though they have already eaten theirs.",
    ],
    examples: [
      "He gave me a cheeky grin and took the last chip.",
      "That was a cheeky question to ask your boss!",
    ],
  },
  stubborn: {
    hints: [
      "You will not change your mind.",
      "Everyone shows you a shorter route, but you still insist on going your way.",
    ],
    examples: [
      "Don't be stubborn; let someone help you.",
      "She was too stubborn to admit she was wrong.",
    ],
  },
  sarcastic: {
    hints: [
      "Saying something you do not really mean to show annoyance or make fun of someone.",
      "Someone arrives very late. You say ‘Perfect timing!’ but you actually mean the timing was bad.",
    ],
    examples: [
      "‘Lovely weather,’ he said in a sarcastic voice as rain soaked his shoes.",
      "Her sarcastic ‘Well done’ showed that she was annoyed by the mistake.",
    ],
  },
  pessimistic: {
    hints: [
      "You think things will probably go badly.",
      "Before the match starts, you already think your team will lose.",
    ],
    examples: [
      "He is pessimistic about finding his lost phone.",
      "Don't be so pessimistic; we still have a chance.",
    ],
  },
  prerequisite: {
    hints: [
      "Something you must have or do first.",
      "Before joining an advanced class, you must pass the beginner class. Passing it is required first.",
    ],
    examples: [
      "A driving licence is a prerequisite for this job.",
      "Passing the first course is a prerequisite for joining the next one.",
    ],
  },
  monologue: {
    hints: [
      "One person talks for a long time.",
      "An actor stands on stage alone and gives a speech. Nobody else speaks.",
    ],
    examples: [
      "The play begins with a short monologue.",
      "His story became a long monologue; nobody else could get a word in.",
    ],
  },
  suspicion: {
    hints: [
      "You think something might be true, but you are not sure.",
      "The room is very quiet. You think someone may be hiding there, but you have no proof.",
    ],
    examples: [
      "I have a suspicion that we took the wrong train.",
      "Her suspicion was right: the shop had already closed.",
    ],
  },
  lethal: {
    hints: [
      "Dangerous enough to kill.",
      "This is stronger than ‘harmful’: it can cause someone to die.",
    ],
    examples: [
      "The container was marked as holding a lethal substance.",
      "The report described the gas as potentially lethal.",
    ],
  },
  venomous: {
    hints: [
      "An animal can put poison into you by biting or stinging.",
      "Think of a snake that injects a toxic substance through its teeth.",
    ],
    examples: [
      "The guide warned us about venomous snakes in the area.",
      "A venomous animal can deliver venom through a bite or sting.",
    ],
  },
  poisonous: {
    hints: [
      "It contains something harmful that can make you ill if it enters your body.",
      "A berry looks tasty, but eating it could make you very sick.",
    ],
    examples: [
      "The sign warned that these berries were poisonous.",
      "Some mushrooms are poisonous, even though they look like edible ones.",
    ],
  },
};
