import { ContinuousDynamicExpression } from "../Expressions/ContinuousExpressions/ContinuousDynamicExpression";
import { InstantaneousDynamicExpression } from "../Expressions/InstantaneousDynamicExpression";
import { MultiExpression } from "../Expressions/MultiExpression";
export declare class DynamicsContainer {
    constructor(dynamicExpression: ContinuousDynamicExpression | InstantaneousDynamicExpression, staffNumber: number);
    continuousDynamicExpression: ContinuousDynamicExpression;
    instantaneousDynamicExpression: InstantaneousDynamicExpression;
    staffNumber: number;
    parMultiExpression(): MultiExpression;
    CompareTo(other: DynamicsContainer): number;
}
