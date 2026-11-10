import type { SoundHelp } from "../types/phonetics";

export const ADVANCED_SOUND_HELP: Record<string, SoundHelp> = {
  prerequisite: {
    hints: [
      "A condition that must be fulfilled before something else can happen.",
      "A requirement that comes before taking a further step.",
      "Something necessary before you can begin another activity.",
      "Something you need to have or finish before moving on.",
      "A thing you must have or do before you can do the next thing.",
      "Something you need first.",
    ],
    examples: [
      "A driving licence is a prerequisite for this job.",
      "Passing the first course is a prerequisite for joining the next one.",
    ],
  },
  monologue: {
    hints: [
      "An extended speech delivered by a single speaker.",
      "A long stretch of speech from one person, sometimes as part of a performance.",
      "One person speaking at length rather than taking turns with others.",
      "A speech where one person does all the talking.",
      "One person talks for a while and nobody else takes a turn.",
      "One person talking for a long time.",
    ],
    examples: [
      "The play begins with a short monologue.",
      "His story became a long monologue; nobody else could get a word in.",
    ],
  },
  suspicion: {
    hints: [
      "A belief that something may be true or wrong without sufficient proof.",
      "A feeling that something is happening, even though you cannot be certain.",
      "An idea you think might be right but have not confirmed.",
      "A feeling that you may have guessed what is happening.",
      "You think something may be true, but you do not know for sure.",
      "A feeling that something might be true.",
    ],
    examples: [
      "I have a suspicion that we took the wrong train.",
      "Her suspicion was right: the shop had already closed.",
    ],
  },
  lethal: {
    hints: [
      "Capable of causing death.",
      "Dangerous enough to have a fatal effect.",
      "So harmful that it could end a life.",
      "Able to kill rather than only cause an injury.",
      "Something that can cause someone to die.",
      "Able to kill.",
    ],
    examples: [
      "The container was marked as holding a lethal substance.",
      "The report described the gas as potentially lethal.",
    ],
  },
  venomous: {
    hints: [
      "Able to inject a toxic substance through a bite or sting.",
      "Describing an animal that can deliver a harmful toxin into another body.",
      "Able to put a toxic substance into another creature when biting or stinging.",
      "An animal with a harmful substance it can inject using teeth or a stinger.",
      "Able to make a bite or sting harmful by injecting a toxin.",
      "An animal that can inject poison when it bites or stings.",
    ],
    examples: [
      "The guide warned us about venomous snakes in the area.",
      "A venomous animal can deliver venom through a bite or sting.",
    ],
  },
  poisonous: {
    hints: [
      "Containing a toxic substance that can cause harm when it enters the body.",
      "Able to make a person or animal ill because of a harmful substance it contains.",
      "Harmful if its toxic substance is swallowed, breathed in or absorbed.",
      "Containing something that can make you sick if it gets into your body.",
      "Having a harmful substance inside it.",
      "It contains poison and can make you ill.",
    ],
    examples: [
      "The sign warned that these berries were poisonous.",
      "Some mushrooms are poisonous, even though they look like edible ones.",
    ],
  },
};
