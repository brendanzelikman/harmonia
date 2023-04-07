import { Note } from "./Note";
import { Fraction } from "../../Common/DataObjects/Fraction";
import { Pitch } from "../../Common/DataObjects/Pitch";
import { TieTypes } from "../../Common/Enums/";
import { PlacementEnum } from "../VoiceData/Expressions/AbstractExpression";
/**
 * A [[Tie]] connects two notes of the same pitch and name, indicating that they have to be played as a single note.
 */
export declare class Tie {
    constructor(note: Note, type: TieTypes);
    private notes;
    private type;
    TieNumber: number;
    TieDirection: PlacementEnum;
    /** Can contain tie directions at certain note indices.
     *  For example, if it contains {2: PlacementEnum.Below}, then
     *  the tie should go downwards from Tie.Notes[2] onwards,
     *  even if tie.TieDirection is PlacementEnum.Above (tie starts going up on Notes[0]).
     */
    NoteIndexToTieDirection: NoteIndexToPlacementEnum;
    getTieDirection(startNote?: Note): PlacementEnum;
    get Notes(): Note[];
    get Type(): TieTypes;
    get StartNote(): Note;
    get Duration(): Fraction;
    get Pitch(): Pitch;
    AddNote(note: Note): void;
}
export interface NoteIndexToPlacementEnum {
    [key: number]: PlacementEnum;
}
