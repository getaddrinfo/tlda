import getYear from "../../../../lib/utils/getYear";
import styles from "./Assessment.module.scss";
import { Link } from "react-router-dom";
import { Button } from "../../../button/Button";

export const Assessment = ({
    id,
    name,
    type,
    max_marks: maxMarks,
    grade_boundaries: gradeBoundaries,
    grading_system: gradingSystem,
    year,
    department,
    class: cls,
    has_scores: hasScores,
    can_submit_scores: canSubmitData
}) => {
    const title = cls ? cls.code : `${department.name} - Y${getYear(year.final_year)}`;
    const txt = hasScores ? "Assessed" : "Pending Scores"

    return (
        <li className={styles.assessment}>
            <div className={styles.header}>
                <h1>{name} ({title})</h1>

                <div>
                    <span className={styles.orb}>{type}</span>
                    <span className={[
                        styles.orb,
                        hasScores ? styles.assessed : null,
                        !hasScores ? styles.pending : null
                    ].filter(Boolean).join(" ")}>
                        {txt}
                    </span>
                </div>
            </div>

            <div className={styles.grades}>
                <h3>Grade Boundaries</h3>
                <ul>
                    <li>
                        <b>Maximum:</b>{maxMarks}
                    </li>
                    {gradingSystem.data.map((grade, idx) => (
                        <li>
                            <b>{grade}</b> - {gradeBoundaries[idx]}
                        </li>
                    ))}
                </ul>
            </div>
            
            {canSubmitData && <Link to={`/app/assessments/${id}/submit`}>
                <Button design='blurple' size='small' shape='pill'>
                    Submit scores
                </Button>
            </Link>}
        </li>
    )
}