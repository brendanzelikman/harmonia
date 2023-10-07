import { DemoXML } from "assets/demoXML";
import { getScaleKey } from "types/key";
import MusicXML from "types/musicxml";
import { XML } from "types/units";
import { durationToTicks } from "utils";
import { Scale, isScale, unpackScale } from "./ScaleTypes";

/**
 * Export a Scale to XML.
 * @param pattern Optional. The Scale to export to XML.
 * @returns The XML string. If the Scale is invalid, a demo pattern will be exported.
 */
export const exportScaleToXML = (scale?: Scale): XML => {
  // Return the demo XML if the scale is invalid
  if (!isScale(scale)) return DemoXML;

  // Unpack the scale
  const notes = unpackScale(scale);
  const key = getScaleKey(scale);

  // Create the XML notes
  const xmlNotes = notes.map((note) => {
    return MusicXML.createNote(note, {
      type: "quarter",
      duration: durationToTicks("quarter"),
      voice: 1,
      staff: note >= 60 ? 1 : 2,
      key,
    });
  });

  // Create the measure
  const measure = MusicXML.createMeasure(xmlNotes);

  // Create the part
  const id = `scale`;
  const part = MusicXML.createPart(id, [measure]);
  const scorePart = MusicXML.createScorePart(id);
  const partList = MusicXML.createPartList([scorePart]);

  // Create the score
  const score = MusicXML.createScore(partList, [part]);

  // Return the XML
  return MusicXML.serialize(score);
};
