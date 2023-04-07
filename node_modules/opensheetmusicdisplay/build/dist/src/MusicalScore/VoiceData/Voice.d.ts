import { Instrument } from "../Instrument";
import { VoiceEntry } from "./VoiceEntry";
/**
 * A [[Voice]] contains all the [[VoiceEntry]]s in a voice in a [[StaffLine]].
 */
export declare class Voice {
    private voiceEntries;
    private parent;
    private visible;
    private audible;
    private following;
    /**
     * The Id given in the MusicXMl file to distinguish the different voices. It is unique per instrument.
     */
    private voiceId;
    private volume;
    constructor(parent: Instrument, voiceId: number);
    get VoiceEntries(): VoiceEntry[];
    get Parent(): Instrument;
    get Visible(): boolean;
    set Visible(value: boolean);
    get Audible(): boolean;
    set Audible(value: boolean);
    get Following(): boolean;
    set Following(value: boolean);
    get VoiceId(): number;
    get Volume(): number;
    set Volume(value: number);
}
