import { ITransposeCalculator } from "../../MusicalScore/Interfaces";
import { Pitch } from "../../Common/DataObjects";
import { KeyInstruction } from "../../MusicalScore/VoiceData/Instructions";
/** Calculates transposition of individual notes and keys,
 * which is used by multiple OSMD classes to transpose the whole sheet.
 * Note: This class may not look like much, but a lot of thought has gone into the algorithms,
 * and the exact usage within OSMD classes. */
export declare class TransposeCalculator implements ITransposeCalculator {
    private static keyMapping;
    private static noteEnums;
    transposePitch(pitch: Pitch, currentKeyInstruction: KeyInstruction, halftones: number): Pitch;
    transposeKey(keyInstruction: KeyInstruction, transpose: number): void;
}
