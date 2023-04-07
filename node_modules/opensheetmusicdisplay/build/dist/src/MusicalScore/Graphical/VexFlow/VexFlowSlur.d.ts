import Vex from "vexflow";
import VF = Vex.Flow;
import { Slur } from "../../VoiceData/Expressions/ContinuousExpressions/Slur";
export interface ICurveOptions {
    spacing: number;
    thickness: number;
    x_shift: number;
    y_shift: number;
    position: CurvePositionEnum;
    position_end: CurvePositionEnum;
    invert: boolean;
    cps: [{
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }];
}
export declare enum CurvePositionEnum {
    NEAR_HEAD = 1,
    NEAR_TOP = 2
}
export declare class VexFlowSlur {
    constructor(parentslur: Slur);
    /**
     * Copy constructor: generate a VexFlowSlur from an existing one
     */
    static createFromVexflowSlur(vfSlur: VexFlowSlur): VexFlowSlur;
    get vfSlur(): Slur;
    private parentSlur;
    vfStartNote: VF.StemmableNote;
    vfEndNote: VF.StemmableNote;
    vfCurve: VF.Curve;
    curve_Options(): ICurveOptions;
    createVexFlowCurve(): void;
}
