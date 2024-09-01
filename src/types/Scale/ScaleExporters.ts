import { DemoXML } from "assets/demoXML";
import { MusicXML } from "lib/musicxml";
import { Thunk } from "types/Project/ProjectTypes";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import { selectTransport } from "types/Transport/TransportSelectors";
import { MIDI, XML } from "types/units";
import { EighthNoteTicks, getDurationTicks } from "utils/durations";
import { downloadBlob } from "utils/html";
import { getScaleKey } from "utils/key";
import { getScaleName } from "utils/key";
import { getScaleNotes, getScaleNoteMidiValue } from "./ScaleFunctions";
import { isScale } from "./ScaleTypes";
import { MidiValue } from "types/units";
import { Midi } from "@tonejs/midi";

/** Export a Scale to XML and return the XML string, downloading if specified. */
export const exportScaleToXML = (scale?: MIDI[], download = false): XML => {
  if (!isScale(scale)) return DemoXML;

  // Unpack the scale
  const notes = getScaleNotes(scale);
  const size = notes.length;
  const key = getScaleKey(notes);

  // Create the XML notes
  const xmlNotes = notes.map((note) => {
    const midi = getScaleNoteMidiValue(note);
    const quarterTicks = getDurationTicks("quarter");
    return MusicXML.createBlock(
      [{ MIDI: midi, duration: quarterTicks, velocity: 60 }],
      {
        type: "quarter",
        duration: getDurationTicks("quarter"),
        voice: 1,
        staff: midi >= 58 ? 1 : 2,
        key,
      }
    );
  });

  // Create the measure
  const measure = MusicXML.createMeasure(xmlNotes, { quarters: size });

  // Create the part
  const id = `scale`;
  const part = MusicXML.createPart(id, [measure]);
  const scorePart = MusicXML.createScorePart(id);
  const partList = MusicXML.createPartList([scorePart]);

  // Create the score
  const score = MusicXML.createScore(partList, [part]);
  const xml = MusicXML.serialize(score);

  // Download the blob if specified
  if (download) {
    const blob = new Blob([xml], { type: MusicXML.MIME_TYPE });
    downloadBlob(blob, `${key || "scale"}.xml`);
  }

  // Return the XML string
  return xml;
};

/** Export a scale to MIDI and download it as a file. */
export const exportScaleToMIDI =
  (scale?: MidiValue[]): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const transport = selectTransport(project);

    // Create a new MIDI file with a single track
    const midi = new Midi();
    const track = midi.addTrack();

    // Get the scale notes and name
    const notes = getScaleNotes(scale);
    const name = getScaleName(scale);

    // Add the notes to the track
    notes.forEach((note, i) => {
      track.addNote({
        midi: getScaleNoteMidiValue(note),
        time: convertTicksToSeconds(transport, i * EighthNoteTicks),
      });
    });

    // Export the MIDI file
    const blob = new Blob([midi.toArray()], { type: "audio/midi" });
    downloadBlob(blob, `${name || "scale"}.mid`);
  };
