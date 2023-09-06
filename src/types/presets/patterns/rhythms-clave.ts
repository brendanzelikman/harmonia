import { MIDI, Pattern } from "types";

export const TwoThreeSonClave: Pattern = {
  id: "2-3-son-clave",
  name: "2-3 Son Clave",
  stream: [
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createDottedEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
  ],
};
export const ThreeTwoSonClave: Pattern = {
  id: "3-2-son-clave",
  name: "3-2 Son Clave",
  stream: [
    [MIDI.createDottedEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
  ],
};
export const TwoThreeRumbaClave: Pattern = {
  id: "2-3-rumba-clave",
  name: "2-3 Rumba Clave",
  stream: [
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
  ],
};
export const ThreeTwoRumbaClave: Pattern = {
  id: "3-2-rumba-clave",
  name: "3-2 Rumba Clave",
  stream: [
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
  ],
};
export const TwoThreeBossaNovaClave: Pattern = {
  id: "2-3-bossa-nova-clave",
  name: "2-3 Bossa Nova Clave",
  stream: [
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
  ],
};
export const ThreeTwoBossaNovaClave: Pattern = {
  id: "3-2-bossa-nova-clave",
  name: "3-2 Bossa Nova Clave",
  stream: [
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
  ],
};
