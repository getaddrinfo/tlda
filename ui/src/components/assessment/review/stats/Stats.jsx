import styles from "./Stats.module.scss";
import { StatComparisonGroup } from "../statComparisonGroup/StatComparisonGroup";
import { RawStat } from "../rawStat/RawStat";

export const Stats = ({ statistics, calculated, names }) => {
    return <div className={styles.stats}>
        {/* Comparative (pos, neg, eq) list */}
        <StatComparisonGroup group={calculated.standardDeviation} template="{value} {compare} consistent than" names={names} args={{
            compare: {
                "eq": "same",
                "gt": "more",
                "lt": "less"
            },
        }} />
        <StatComparisonGroup
            group={calculated.mean}
            template="{value} {compare} vs"
            names={names}
            args={{
                compare: {
                    "gt": "higher score on average",
                    "lt": "lower score on average",
                    "eq": "equal average score"
                }
            }}
        />
        <StatComparisonGroup
            group={calculated.variance}
            template="{value} {compare} than"
            names={names}
            args={{
                compare: {
                    "gt": "less spread",
                    "lt": "more spread",
                    "eq": "equal spread"
                }
            }}
            negativeBetter={true}
        />

        {/* List of raw values */}
        <ul className={styles.specificStats}>
            <RawStat name="Variance" value={statistics.variance} />
            <RawStat name="Average Score" value={statistics.mean} />
            <RawStat name="Standard Deviation" value={statistics.standardDeviation} />
        </ul>
    </div>
};