import { Voice } from "../VoiceData/Voice";
import { StemDirectionType } from "../VoiceData/VoiceEntry";
import { Note } from "../VoiceData/Note";
import { SourceMeasure } from "../VoiceData/SourceMeasure";
import { SourceStaffEntry } from "../VoiceData/SourceStaffEntry";
import { Fraction } from "../../Common/DataObjects/Fraction";
import { IXmlElement } from "../../Common/FileIO/Xml";
import { Staff } from "../VoiceData/Staff";
import { SlurReader } from "./MusicSymbolModules/SlurReader";
import { NoteType } from "../VoiceData/NoteType";
import { ReaderPluginManager } from "./ReaderPluginManager";
export declare class VoiceGenerator {
    constructor(pluginManager: ReaderPluginManager, staff: Staff, voiceId: number, slurReader: SlurReader, mainVoice?: Voice);
    pluginManager: ReaderPluginManager;
    private slurReader;
    private lyricsReader;
    private articulationReader;
    private musicSheet;
    private voice;
    private currentVoiceEntry;
    private currentNote;
    private currentMeasure;
    private currentStaffEntry;
    private staff;
    private instrument;
    private openBeams;
    private beamNumberOffset;
    private get openTieDict();
    private currentOctaveShift;
    private tupletDict;
    private openTupletNumber;
    get GetVoice(): Voice;
    get OctaveShift(): number;
    set OctaveShift(value: number);
    /**
     * Create new [[VoiceEntry]], add it to given [[SourceStaffEntry]] and if given so, to [[Voice]].
     * @param musicTimestamp
     * @param parentStaffEntry
     * @param addToVoice
     * @param isGrace States whether the new VoiceEntry (only) has grace notes
     */
    createVoiceEntry(musicTimestamp: Fraction, parentStaffEntry: SourceStaffEntry, addToVoice: boolean, isGrace?: boolean, graceNoteSlash?: boolean, graceSlur?: boolean): void;
    /**
     * Create [[Note]]s and handle Lyrics, Articulations, Beams, Ties, Slurs, Tuplets.
     * @param noteNode
     * @param noteDuration
     * @param divisions
     * @param restNote
     * @param parentStaffEntry
     * @param parentMeasure
     * @param measureStartAbsoluteTimestamp
     * @param maxTieNoteFraction
     * @param chord
     * @param octavePlusOne Software like Guitar Pro gives one octave too low, so we need to add one
     * @param printObject whether the note should be rendered (true) or invisible (false)
     * @returns {Note}
     */
    read(noteNode: IXmlElement, noteDuration: Fraction, typeDuration: Fraction, noteTypeXml: NoteType, normalNotes: number, restNote: boolean, parentStaffEntry: SourceStaffEntry, parentMeasure: SourceMeasure, measureStartAbsoluteTimestamp: Fraction, maxTieNoteFraction: Fraction, chord: boolean, octavePlusOne: boolean, printObject: boolean, isCueNote: boolean, isGraceNote: boolean, stemDirectionXml: StemDirectionType, tremoloStrokes: number, stemColorXml: string, noteheadColorXml: string, vibratoStrokes: boolean, dotsXml: number): Note;
    /**
     * Create a new [[StaffEntryLink]] and sets the currenstStaffEntry accordingly.
     * @param index
     * @param currentStaff
     * @param currentStaffEntry
     * @param currentMeasure
     * @returns {SourceStaffEntry}
     */
    checkForStaffEntryLink(index: number, currentStaff: Staff, currentStaffEntry: SourceStaffEntry, currentMeasure: SourceMeasure): SourceStaffEntry;
    checkForOpenBeam(): void;
    checkOpenTies(): void;
    hasVoiceEntry(): boolean;
    private readArticulations;
    /**
     * Create a new [[Note]] and adds it to the currentVoiceEntry
     * @param node
     * @param noteDuration
     * @param divisions
     * @param chord
     * @param octavePlusOne Software like Guitar Pro gives one octave too low, so we need to add one
     * @returns {Note}
     */
    private addSingleNote;
    /**
     * Create a new rest note and add it to the currentVoiceEntry.
     * @param noteDuration
     * @param divisions
     * @returns {Note}
     */
    private addRestNote;
    private addNoteInfo;
    /**
     * Handle the currentVoiceBeam.
     * @param node
     * @param note
     */
    private createBeam;
    private endBeam;
    /**
     * Check for open [[Beam]]s at end of [[SourceMeasure]] and closes them explicity.
     */
    private handleOpenBeam;
    /**
     * Create a [[Tuplet]].
     * @param node
     * @param tupletNodeList
     * @returns {number}
     */
    private addTuplet;
    /**
     * This method handles the time-modification IXmlElement for the Tuplet case (tupletNotes not at begin/end of Tuplet).
     * @param noteNode
     */
    private handleTimeModificationNode;
    private addTie;
    private getTieDirection;
    /**
     * Find the next free int (starting from 0) to use as key in TieDict.
     * @returns {number}
     */
    private getNextAvailableNumberForTie;
    /**
     * Search the tieDictionary for the corresponding candidateNote to the currentNote (same FundamentalNote && Octave).
     * @param candidateNote
     * @returns {number}
     */
    private findCurrentNoteInTieDict;
    /**
     * Calculate the normal duration of a [[Tuplet]] note.
     * @param xmlNode
     * @returns {any}
     */
    private getTupletNoteDurationFromType;
}
