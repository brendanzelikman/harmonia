import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const TwoThreeSonClave: Pattern = {
  id: "pattern_preset_2-3-son-clave",
  name: "2-3 Son Clave",
  stream: [
    _.createEighthRest(),
    [_.createEighthNote()],
    [_.createEighthNote()],
    _.createEighthRest(),
    [_.createDottedEighthNote()],
    [_.createSixteenthNote()],
    _.createEighthRest(),
    [_.createEighthNote()],
  ],
};
export const ThreeTwoSonClave: Pattern = {
  id: "pattern_preset_3-2-son-clave",
  name: "3-2 Son Clave",
  stream: [
    [_.createDottedEighthNote()],
    [_.createSixteenthNote()],
    _.createEighthRest(),
    [_.createEighthNote()],
    _.createEighthRest(),
    [_.createEighthNote()],
    [_.createEighthNote()],
    _.createEighthRest(),
  ],
};
export const TwoThreeRumbaClave: Pattern = {
  id: "pattern_preset_2-3-rumba-clave",
  name: "2-3 Rumba Clave",
  stream: [
    _.createEighthRest(),
    [_.createEighthNote()],
    [_.createEighthNote()],
    _.createEighthRest(),
    [_.createEighthNote()],
    _.createSixteenthRest(),
    _.createEighthRest(),
    [_.createSixteenthNote()],
    _.createEighthRest(),
    _.createSixteenthRest(),
    _.createEighthRest(),
    [_.createSixteenthNote()],
  ],
};
export const ThreeTwoRumbaClave: Pattern = {
  id: "pattern_preset_3-2-rumba-clave",
  name: "3-2 Rumba Clave",
  stream: [
    [_.createEighthNote()],
    _.createSixteenthRest(),
    _.createEighthRest(),
    [_.createSixteenthNote()],
    _.createEighthRest(),
    _.createSixteenthRest(),
    _.createEighthRest(),
    [_.createSixteenthNote()],
    _.createEighthRest(),
    [_.createEighthNote()],
    [_.createEighthNote()],
    _.createEighthRest(),
  ],
};
export const TwoThreeBossaNovaClave: Pattern = {
  id: "pattern_preset_2-3-bossa-nova-clave",
  name: "2-3 Bossa Nova Clave",
  stream: [
    _.createEighthRest(),
    [_.createEighthNote()],
    _.createSixteenthRest(),
    _.createEighthRest(),
    [_.createSixteenthNote()],
    _.createEighthRest(),
    [_.createEighthNote()],
    _.createSixteenthRest(),
    _.createEighthRest(),
    [_.createSixteenthNote()],
    _.createEighthRest(),
    [_.createEighthNote()],
  ],
};
export const ThreeTwoBossaNovaClave: Pattern = {
  id: "pattern_preset_3-2-bossa-nova-clave",
  name: "3-2 Bossa Nova Clave",
  stream: [
    [_.createEighthNote()],
    _.createSixteenthRest(),
    _.createEighthRest(),
    [_.createSixteenthNote()],
    _.createEighthRest(),
    [_.createEighthNote()],
    _.createEighthRest(),
    [_.createEighthNote()],
    _.createSixteenthRest(),
    _.createEighthRest(),
    [_.createSixteenthNote()],
    _.createEighthRest(),
  ],
};

export default {
  TwoThreeSonClave,
  ThreeTwoSonClave,
  TwoThreeRumbaClave,
  ThreeTwoRumbaClave,
  TwoThreeBossaNovaClave,
  ThreeTwoBossaNovaClave,
};
