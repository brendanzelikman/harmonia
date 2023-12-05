import { Pattern } from "types/Pattern";
import * as _ from "utils/durations";

export const Habanera: Pattern = {
  id: "habanera",
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
  id: "tresillo",
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
  id: "cinquillo",
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
  id: "baqueteo",
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
  id: "cascara",
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
  id: "montuno",
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
