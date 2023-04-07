import { SkyBottomLineBatchCalculatorBackendType } from "../../OpenSheetMusicDisplay";
import { StaffLine } from "./StaffLine";
/**
 * This class calculates the skylines and the bottom lines for multiple stafflines.
 */
export declare class SkyBottomLineBatchCalculator {
    private batches;
    constructor(staffLines: StaffLine[], preferredBackend: SkyBottomLineBatchCalculatorBackendType);
    /**
     * This method calculates the skylines and the bottom lines for the stafflines passed to the constructor.
     */
    calculateLines(): void;
}
