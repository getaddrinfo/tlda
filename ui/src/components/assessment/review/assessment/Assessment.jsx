import styles from "./Assessment.module.scss";

import { Stats } from "../stats/Stats";
import { Grade } from "../grade/Grade";

export const Assessment = ({
    assessment,
    analysed,
    names
}) => {
    return <li className={styles.assessment}>
        <h2>{assessment.name}</h2>
        <Stats {...assessment} calculated={analysed} names={names} />
        <ul className={styles.scores}>
            {assessment.grading.values
                .sort((a, b) => b.mark - a.mark)
                .map((grade) => (
                    <Grade
                        {...grade}
                        key={grade.id}
                        assessment={assessment}
                    />
                ))}
        </ul>
    </li>
}