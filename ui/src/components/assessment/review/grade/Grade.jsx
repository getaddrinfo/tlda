import styles from "./Grade.module.scss";
import { Orb } from "../orb/Orb";

import { getGrade } from "../../../../lib/utils/grade";

export const Grade = ({ id, mark, marker, student, assessment }) => {
    const { statistics, grading } = assessment; 

    // a value is considered statistically insiginificant
    // if it is 2*sd away from the mean
    const isHighGrade = mark > (statistics.mean + 2 * statistics.standardDeviation);
    const isLowGrade = mark < (statistics.mean - 2 * statistics.standardDeviation);

    return <li className={styles.score} key={id}>
        <div className={styles.header}>
            <h2>{student.name}</h2>
            <Orb highMark={isHighGrade} lowMark={isLowGrade} />
        </div>

        <ul className={styles.info}>
            <li>
                <h4>Mark</h4>
                <p>{mark}</p>
            </li>
            <li>
                <h4>Grade</h4>
                <p>{getGrade(
                    mark,
                    grading.boundaries,
                    grading.system
                )}</p>
            </li>
            <li>
                <h4>Marker</h4>
                <p>{marker.name}</p>
            </li>
        </ul>
    </li>
}