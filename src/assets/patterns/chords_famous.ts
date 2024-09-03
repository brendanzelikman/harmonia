import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/durations";

export const VienneseTrichord: Pattern = {
  id: "pattern_preset_viennese-trichord",
  name: "Viennese Trichord",
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(66), _.createQuarterNote(67)],
  ],
};
export const TristanChord: Pattern = {
  id: "pattern_preset_tristan-chord",
  name: "Tristan Chord",
  stream: [
    [
      _.createQuarterNote(53),
      _.createQuarterNote(59),
      _.createQuarterNote(63),
      _.createQuarterNote(68),
    ],
  ],
};
export const BridgeChord: Pattern = {
  id: "pattern_preset_bridge-chord",
  name: "Bridge Chord",
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
      _.createQuarterNote(86),
      _.createQuarterNote(90),
      _.createQuarterNote(93),
    ],
  ],
};
export const MysticChord: Pattern = {
  id: "pattern_preset_mystic-chord",
  name: "Mystic Chord",
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(66),
      _.createQuarterNote(70),
      _.createQuarterNote(76),
      _.createQuarterNote(81),
      _.createQuarterNote(86),
    ],
  ],
};
export const ElektraChord: Pattern = {
  id: "pattern_preset_elektra-chord",
  name: "Elektra Chord",
  stream: [
    [
      _.createQuarterNote(64),
      _.createQuarterNote(71),
      _.createQuarterNote(73),
      _.createQuarterNote(77),
      _.createQuarterNote(80),
    ],
  ],
};
export const FarbenChord: Pattern = {
  id: "pattern_preset_farben-chord",
  name: "Farben Chord",
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(68),
      _.createQuarterNote(71),
      _.createQuarterNote(76),
      _.createQuarterNote(82),
    ],
  ],
};
export const OdeToNapoleonChord: Pattern = {
  id: "pattern_preset_ode-to-napoleon-chord",
  name: "Ode to Napoleon Chord",
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(61),
      _.createQuarterNote(64),
      _.createQuarterNote(65),
      _.createQuarterNote(68),
      _.createQuarterNote(69),
    ],
  ],
};

export const RiteOfSpringChord: Pattern = {
  id: "pattern_preset_rite-of-spring-chord",
  name: "Rite of Spring Chord",
  stream: [
    [
      _.createQuarterNote(40),
      _.createQuarterNote(44),
      _.createQuarterNote(47),
      _.createQuarterNote(52),
      _.createQuarterNote(55),
      _.createQuarterNote(58),
      _.createQuarterNote(61),
      _.createQuarterNote(63),
    ],
  ],
};
export const DreamChord: Pattern = {
  id: "pattern_preset_dream-chord",
  name: "Dream Chord",
  stream: [
    [
      _.createQuarterNote(67),
      _.createQuarterNote(72),
      _.createQuarterNote(73),
      _.createQuarterNote(74),
    ],
  ],
};

export const HendrixChord: Pattern = {
  id: "pattern_preset_hendrix-chord",
  name: "Hendrix Chord",
  stream: [
    [
      _.createQuarterNote(40),
      _.createQuarterNote(52),
      _.createQuarterNote(56),
      _.createQuarterNote(62),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
    ],
  ],
};
export const SoWhatChord: Pattern = {
  id: "pattern_preset_so-what-chord",
  name: "So What Chord",
  stream: [
    [
      _.createQuarterNote(52),
      _.createQuarterNote(57),
      _.createQuarterNote(62),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
    ],
  ],
};
export const BondChord: Pattern = {
  id: "pattern_preset_james-bond-chord",
  name: "James Bond Chord",
  stream: [
    [
      _.createQuarterNote(52),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
      _.createQuarterNote(75),
      _.createQuarterNote(78),
    ],
  ],
};
export const KennyBarronMajorChord: Pattern = {
  id: "pattern_preset_kenny-barron-major-chord",
  name: "Kenny Barron Major Chord",
  stream: [
    [
      _.createQuarterNote(48),
      _.createQuarterNote(55),
      _.createQuarterNote(62),
      _.createQuarterNote(64),
      _.createQuarterNote(71),
      _.createQuarterNote(78),
    ],
  ],
};
export const KennyBarronMinorChord: Pattern = {
  id: "pattern_preset_kenny-barron-minor-chord",
  name: "Kenny Barron Minor Chord",
  stream: [
    [
      _.createQuarterNote(48),
      _.createQuarterNote(55),
      _.createQuarterNote(62),
      _.createQuarterNote(63),
      _.createQuarterNote(70),
      _.createQuarterNote(77),
    ],
  ],
};
export const MuMajorChord: Pattern = {
  id: "pattern_preset_mu-major-chord",
  name: "Mu Major Chord",
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
    ],
  ],
};

export default {
  VienneseTrichord,
  TristanChord,
  BridgeChord,
  MysticChord,
  ElektraChord,
  FarbenChord,
  OdeToNapoleonChord,
  RiteOfSpringChord,
  DreamChord,
  SoWhatChord,
  KennyBarronMajorChord,
  KennyBarronMinorChord,
  MuMajorChord,
  HendrixChord,
  BondChord,
};
