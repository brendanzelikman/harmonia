import { SAMPLE_STORE } from "utils/constants";
import { InstrumentKey } from "types/Instrument/InstrumentTypes";
import { getDatabase } from "./database";
import { getProjects } from "./projects";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { selectTracksByInstrumentKey } from "types/Track/TrackSelectors";
import {
  decodeAudioBuffer,
  readAudioBuffer,
  encodeAudioBuffer,
  DecodedBuffer,
} from "utils/buffer";
import audioBufferToWav from "audiobuffer-to-wav";
import { downloadBlob } from "utils/event";
import { dispatchCustomEvent } from "utils/event";

export const UPDATE_SAMPLES_EVENT = "UPDATE_SAMPLES";

// -------------------------------------------------
// IDB Sample Types
// -------------------------------------------------

/** Safe Buffers can be stored by ID in the database */
export type IDBSample = {
  id: string;
  buffer: DecodedBuffer;
  uploadDate: string;
};

/** Get the ID of a sample */
const getSampleId = (file: File) => `sample-${file.name}`;

/** Get the list of all sample instrument keys */
export const getSampleKeys = async (): Promise<InstrumentKey[]> => {
  const db = await getDatabase();
  if (!db) return [];
  const keys = (await db.getAllKeys(SAMPLE_STORE)) as InstrumentKey[];
  return keys;
};

/* Fetch a sample buffer from the database */
export const getSampleBuffer = async (
  id: string
): Promise<AudioBuffer | undefined> => {
  const db = await getDatabase();
  if (!db) return;
  const sample = await db.get(SAMPLE_STORE, id);
  if (!sample?.buffer) return;
  return encodeAudioBuffer(sample.buffer);
};

/** Upload a sample file to the database. */
export const uploadSample = async (file: File): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;
  const audioBuffer = await readAudioBuffer(file);
  const buffer = decodeAudioBuffer(audioBuffer);
  const id = getSampleId(file);
  const data: IDBSample = { id, buffer, uploadDate: new Date().toISOString() };
  await db.put(SAMPLE_STORE, data);
  dispatchCustomEvent(UPDATE_SAMPLES_EVENT);
};

/** Remove a sample file from the database. */
export const deleteSample = async (key: string): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;
  await db.delete(SAMPLE_STORE, key);
  dispatchCustomEvent(UPDATE_SAMPLES_EVENT);
};

/** Download a sample file from the database. */
export const downloadSample = async (key: string): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;
  const sample = await db.get(SAMPLE_STORE, key);
  if (!sample?.buffer) return;
  const audioBuffer = encodeAudioBuffer(sample.buffer);
  const blob = await new Promise<Blob>((resolve) =>
    resolve(new Blob([audioBufferToWav(audioBuffer)], { type: "audio/wav" }))
  );
  downloadBlob(blob, key);
};

// -------------------------------------------------
// Analyzed Sample Data
// -------------------------------------------------

export type SampleData = {
  key: InstrumentKey;
  buffer: AudioBuffer;
  uploadDate: string;
  projectNames: string[];
  samplerCounts: number;
};

/* Fetch all samples from the database */
export const getSampleDataFromIDB = async (): Promise<SampleData[]> => {
  const db = await getDatabase();
  if (!db) return [];
  const keys = (await db.getAllKeys(SAMPLE_STORE)) as InstrumentKey[];
  const allProjects = await getProjects();
  return Promise.all(
    keys.map(async (key) => {
      const sample = await db.get(SAMPLE_STORE, key);
      if (!sample?.buffer) throw new Error("Sample not found");
      const buffer = encodeAudioBuffer(sample.buffer);
      let samplerCounts = 0;

      // Get all projects that use this sample
      const projects = allProjects.filter((p) => {
        const tracks = selectTracksByInstrumentKey(p, key);
        samplerCounts += tracks.length;
        return tracks.length > 0;
      });
      const projectNames = projects.map(selectProjectName);

      // Return the sample data
      const uploadDate = sample.uploadDate ?? new Date().toISOString();
      return { key, buffer, samplerCounts, uploadDate, projectNames };
    })
  );
};
