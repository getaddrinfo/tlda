import { isUnknown } from "../../../../lib/utils/unknown";
import styles from "./StatComparison.module.scss";
import { IconDown, IconUp, IconNeutral } from "../icons/Icon";

export const StatComparison = ({ comparedTo, template, value, args, negativeBetter = false }) => {
    // if the value could not be calculated (division by 0)
    // return a nice message to the user
    if (isUnknown(value)) {
        return <li>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M13 17.5a1 1 0 11-2 0 1 1 0 012 0zm-.25-8.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5z"></path><path fill-rule="evenodd" d="M9.836 3.244c.963-1.665 3.365-1.665 4.328 0l8.967 15.504c.963 1.667-.24 3.752-2.165 3.752H3.034c-1.926 0-3.128-2.085-2.165-3.752L9.836 3.244zm3.03.751a1 1 0 00-1.732 0L2.168 19.499A1 1 0 003.034 21h17.932a1 1 0 00.866-1.5L12.866 3.994z"></path></svg>
            <span>Could not calculate the value</span>
        </li>
    }

    // if it was greater than the other value
    const gt = negativeBetter ? value < 0 : value > 0;

    // if it was less than the other value
    const lt = negativeBetter ? value > 0 : value < 0;

    // the icon that should be rendered:
    // - lt: down chevron
    // - gt: up chevron
    // - eq: dash
    const Icon = lt ? IconDown : gt ? IconUp : IconNeutral;

    // index for the comparison value
    const idx = lt ? "lt" : gt ? "gt" : "eq";

    // percentage representation of the value
    const repr = Math.round(Math.abs(value));

    // format template
    template = template
        .replace("{value}", `${repr}%`)
        .replace("{compare}", args.compare[idx] ?? "INVALID_VALUE")


    return <li className={styles.statComparison}>
        <Icon /> <span>{template} <b>{comparedTo}</b></span>
    </li>
}