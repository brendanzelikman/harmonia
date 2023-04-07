import Vex from "vexflow";
import VF = Vex.Flow;
import { VexFlowBackend } from "./VexFlowBackend";
import { FontStyles } from "../../../Common/Enums/FontStyles";
import { Fonts } from "../../../Common/Enums/Fonts";
import { RectangleF2D } from "../../../Common/DataObjects/RectangleF2D";
import { PointF2D } from "../../../Common/DataObjects/PointF2D";
import { BackendType } from "../../../OpenSheetMusicDisplay/OSMDOptions";
import { EngravingRules } from "../EngravingRules";
export declare class SvgVexFlowBackend extends VexFlowBackend {
    private ctx;
    zoom: number;
    constructor(rules: EngravingRules);
    getVexflowBackendType(): VF.Renderer.Backends;
    getOSMDBackendType(): BackendType;
    getCanvasSize(): number;
    initialize(container: HTMLElement, zoom: number): void;
    getContext(): VF.SVGContext;
    getSvgElement(): SVGElement;
    removeNode(node: Node): boolean;
    clear(): void;
    scale(k: number): void;
    translate(x: number, y: number): void;
    renderText(fontHeight: number, fontStyle: FontStyles, font: Fonts, text: string, heightInPixel: number, screenPosition: PointF2D, color?: string, fontFamily?: string): Node;
    renderRectangle(rectangle: RectangleF2D, styleId: number, colorHex: string, alpha?: number): Node;
    renderLine(start: PointF2D, stop: PointF2D, color?: string, lineWidth?: number): Node;
    renderCurve(points: PointF2D[]): Node;
    export(): void;
}
