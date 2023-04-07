import { AClassHierarchyTrackable } from "../Interfaces/AClassHierarchyTrackable";
import { BoundingBox } from "./BoundingBox";
export declare class GraphicalObject extends AClassHierarchyTrackable {
    protected boundingBox: BoundingBox;
    get PositionAndShape(): BoundingBox;
    set PositionAndShape(value: BoundingBox);
}
