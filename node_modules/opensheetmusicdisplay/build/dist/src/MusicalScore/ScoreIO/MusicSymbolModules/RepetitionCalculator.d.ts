import { RepetitionInstruction } from "../../VoiceData/Instructions/RepetitionInstruction";
import { MusicSheet } from "../../MusicSheet";
export declare class RepetitionCalculator {
    private musicSheet;
    private repetitionInstructions;
    private currentMeasure;
    private currentMeasureIndex;
    /**
     * Is called when all repetition symbols have been read from xml.
     * Creates the repetition instructions and adds them to the corresponding measure.
     * Creates the logical repetition objects for iteration and playback.
     * @param musicSheet
     * @param repetitionInstructions
     */
    calculateRepetitions(musicSheet: MusicSheet, repetitionInstructions: RepetitionInstruction[]): void;
    private handleRepetitionInstructions;
}
