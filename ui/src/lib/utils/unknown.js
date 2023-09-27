import { SYMBOL_UNKNOWN_DEVIATION, SYMBOL_UNKNOWN_MEAN, SYMBOL_UNKNOWN_VARIANCE } from "../../lib/store/assessmentCompare";

export const isUnknown = (value) => {
    return [
        SYMBOL_UNKNOWN_DEVIATION,
        SYMBOL_UNKNOWN_MEAN,
        SYMBOL_UNKNOWN_VARIANCE
    ].includes(value);
}