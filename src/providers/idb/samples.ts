import { SAMPLE_STORE } from "utils/constants";
import { InstrumentKey } from "types/Instrument/InstrumentTypes";
import { getDatabase } from "./database";
import { getProjectsFromDB } from "./projects";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { selectTracksByInstrumentKey } from "types/Track/TrackSelectors";
import {
  audioBufferToObject,
  fileToAudioBuffer,
  objectToAudioBuffer,
  SafeBuffer,
} from "utils/samples";
import audioBufferToWav from "audiobuffer-to-wav";
import { dispatchCustomEvent } from "utils/html";

export const UPDATE_SAMPLES = "UPDATE_SAMPLES";

export type IDBSample = {
  id: string;
  buffer: SafeBuffer;
};

export type SampleData = {
  key: InstrumentKey;
  buffer: AudioBuffer;
  projectNames: string[];
  samplerCounts: number;
};

/** Append the data to the name of the file */
const getSampleKey = (file: File): string => {
  const name = file.name;
  return `sample-${name}`;
};

/** Get the list of all sample keys */
export const getSampleKeys = async (): Promise<InstrumentKey[]> => {
  const db = await getDatabase();
  if (!db) return [];
  const keys = (await db.getAllKeys(SAMPLE_STORE)) as InstrumentKey[];
  return keys;
};

/** Upload a sample file to the database. */
export const uploadSampleToIDB = async (file: File): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;
  const audioBuffer = await fileToAudioBuffer(file);
  const buffer = audioBufferToObject(audioBuffer);
  const id = getSampleKey(file);
  const data: IDBSample = { id, buffer };
  await db.put(SAMPLE_STORE, data);
  dispatchCustomEvent(UPDATE_SAMPLES);
};

/** Remove a sample file from the database. */
export const deleteSampleFromIDB = async (key: string): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;
  await db.delete(SAMPLE_STORE, key);
  dispatchCustomEvent(UPDATE_SAMPLES);
};

/** Download a sample file from the database. */
export const downloadSampleFromIDB = async (key: string): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;
  const sample = await db.get(SAMPLE_STORE, key);
  if (!sample) return;
  const audioBuffer = objectToAudioBuffer(sample.buffer);
  const blob = await new Promise<Blob>((resolve) => {
    const wav = audioBufferToWav(audioBuffer);
    const blob = new Blob([wav], { type: "audio/wav" });
    resolve(blob);
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = key;
  a.click();
  URL.revokeObjectURL(url);
};

/* Fetch all samples from the database */
export const getSampleDataFromIDB = async (): Promise<SampleData[]> => {
  const db = await getDatabase();
  if (!db) return [];
  const keys = (await db.getAllKeys(SAMPLE_STORE)) as InstrumentKey[];
  const allProjects = await getProjectsFromDB();
  return Promise.all(
    keys.map(async (key) => {
      const sample = await db.get(SAMPLE_STORE, key);
      const buffer = objectToAudioBuffer(sample.buffer);
      let samplerCounts = 0;

      // Get all projects that use this sample
      const projects = allProjects.filter((p) => {
        const tracks = selectTracksByInstrumentKey(p, key);
        samplerCounts += tracks.length;
        return tracks.length > 0;
      });
      const projectNames = projects.map(selectProjectName);

      // Return the sample data
      return { key, buffer, samplerCounts, projectNames };
    })
  );
};

/* Fetch a sample buffer from the database */
export const getSampleBufferFromIDB = async (
  id: string
): Promise<AudioBuffer | undefined> => {
  const db = await getDatabase();
  if (!db) return;
  const sample = await db.get(SAMPLE_STORE, id);
  if (!sample) return;
  return objectToAudioBuffer(sample.buffer);
};
