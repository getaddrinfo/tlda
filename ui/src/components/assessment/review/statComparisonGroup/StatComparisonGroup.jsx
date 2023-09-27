import styles from "./StatComparisonGroup.module.scss";
import { StatComparison } from "../statComparison/StatComparison";

export const StatComparisonGroup = ({ group, template, names, args, negativeBetter = false }) => {
    const entries = Object.entries(group);
    return <ul className={styles.statComparisonGroup}>
        {entries.map(([id, value]) => <StatComparison template={template} args={args} comparedTo={names[id]} value={value} negativeBetter={negativeBetter} />)}
    </ul>
}