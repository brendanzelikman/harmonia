import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/durations";

export const Habanera: Pattern = {
  id: "pattern_preset_habanera",
  name: "Habanera",
  stream: [
    [_.createEighthNote()],
    _.createSixteenthRest(),
    [_.createSixteenthNote()],
    [_.createEighthNote()],
    [_.createEighthNote()],
    [_.createEighthNote()],
    _.createSixteenthRest(),
    [_.createSixteenthNote()],
    [_.createEighthNote()],
    [_.createEighthNote()],
  ],
};
export const Tresillo: Pattern = {
  id: "pattern_preset_tresillo",
  name: "Tresillo",
  stream: [
    [_.createDottedEighthNote()],
    [_.createDottedEighthNote()],
    [_.createEighthNote()],
    [_.createDottedEighthNote()],
    [_.createDottedEighthNote()],
    [_.createEighthNote()],
  ],
};
export const Cinquillo: Pattern = {
  id: "pattern_preset_cinquillo",
  name: "Cinquillo",
  stream: [
    [_.createEighthNote()],
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createEighthNote()],
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
  ],
};
export const Baqueteo: Pattern = {
  id: "pattern_preset_baqueteo",
  name: "Baqueteo",
  stream: [
    [_.createEighthNote()],
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createEighthNote()],
    [_.createEighthNote()],
    [_.createEighthNote()],
    [_.createEighthNote()],
  ],
};
export const Cascara: Pattern = {
  id: "pattern_preset_cascara",
  name: "Cascara",
  stream: [
    [_.createEighthNote()],
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createSixteenthNote()],
    [_.createEighthNote()],
    [_.createEighthNote()],
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createSixteenthNote()],
  ],
};
export const Montuno: Pattern = {
  id: "pattern_preset_montuno",
  name: "Montuno",
  stream: [
    [_.createEighthNote()],
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createEighthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createEighthNote()],
    [_.createSixteenthNote()],
    _.createSixteenthRest(),
    [_.createEighthNote()],
    [_.createSixteenthNote()],
  ],
};

export default { Habanera, Tresillo, Cinquillo, Baqueteo, Cascara, Montuno };
