import type { SoundHelp } from "../types/phonetics";
import { SOCIAL_SOUND_HELP } from "./socialSoundHelp";
import { ADVANCED_SOUND_HELP } from "./advancedSoundHelp";

export const SOUND_HELP: Record<string, SoundHelp> = {
  vain: {
    hints: [
      "An effort that fails to produce the hoped-for result.",
      "Trying to achieve something without succeeding.",
      "Putting in effort but not reaching your goal.",
      "Spending time or energy without getting a useful result.",
      "You tried, but did not get what you wanted.",
      "You tried, but it did not work.",
    ],
    examples: [
      "I waited in vain for the bus. It never came.",
      "She tried in vain to fix the lamp. It still would not turn on.",
    ],
  },
  versatile: {
    hints: [
      "Able to adapt to a wide range of tasks or situations.",
      "Capable of doing several different kinds of work well.",
      "Useful for more than one purpose.",
      "A person with many skills, or a thing with many uses.",
      "Good at different things, rather than just one.",
      "Able to do lots of different things.",
    ],
    examples: [
      "This versatile jacket works for both hiking and everyday wear.",
      "She is a versatile musician who plays several instruments.",
    ],
  },
  head: {
    hints: [
      "The upper part of the body; also a leader, or the act of going towards a place.",
      "The part above the neck; also the person in charge, or movement towards a destination.",
      "The body part containing your brain; also someone who leads, or going somewhere.",
      "The part with your eyes and ears; also a boss, or travelling in a chosen direction.",
      "Your face is on this body part. It can also mean a leader or going towards somewhere.",
      "The part above your neck; a boss; or going somewhere.",
    ],
    examples: [
      "Body part: Put a hat on your head.",
      "Leader: She is the head of the team.",
      "Movement: Let's head home before it rains.",
    ],
  },
  comfort: {
    hints: [
      "To ease the emotional distress of another person.",
      "To offer care that reduces sadness or fear.",
      "To help someone feel supported when they are upset.",
      "To make a sad person feel less alone.",
      "To help someone feel better after something upsetting.",
      "To help a sad person feel better.",
    ],
    examples: [
      "A hug can comfort a child who is upset.",
      "She stayed to comfort her friend after the bad news.",
    ],
  },
  reassure: {
    hints: [
      "To restore confidence by reducing doubt or anxiety.",
      "To help someone feel confident that things will be all right.",
      "To reduce a worry by offering support or a helpful explanation.",
      "To help someone believe there is less reason to worry.",
      "To make a worried person feel calmer and more sure.",
      "To help someone worry less.",
    ],
    examples: [
      "Please reassure him that his dog is safe.",
      "The teacher tried to reassure us before the exam.",
    ],
  },
  ...SOCIAL_SOUND_HELP,
  ...ADVANCED_SOUND_HELP,
};
