import { Pattern } from "types/pattern";
import { MIDI } from "types/midi";

export const Habanera: Pattern = {
  id: "habanera",
  name: "Habanera",
  stream: [
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
  ],
};
export const Tresillo: Pattern = {
  id: "tresillo",
  name: "Tresillo",
  stream: [
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
  ],
};
export const Cinquillo: Pattern = {
  id: "cinquillo",
  name: "Cinquillo",
  stream: [
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
  ],
};
export const Baqueteo: Pattern = {
  id: "baqueteo",
  name: "Baqueteo",
  stream: [
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
  ],
};
export const Cascara: Pattern = {
  id: "cascara",
  name: "Cascara",
  stream: [
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
  ],
};
export const Montuno: Pattern = {
  id: "montuno",
  name: "Montuno",
  stream: [
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
  ],
};

export default { Habanera, Tresillo, Cinquillo, Baqueteo, Cascara, Montuno };
