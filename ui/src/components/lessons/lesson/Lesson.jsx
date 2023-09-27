import { Teacher } from "../teacher/Teacher"
import { Link } from "react-router-dom"
import styles from "./Lesson.module.scss";

export const Lesson = ({
    id,
    code,
    teachers,
    students,
    targets
}) => {
    return <div className={styles.lesson}>
       <div className={styles.lessonDetails}>
            <h1>{code}</h1>
            <span className={styles.numStudents}><b>{students}</b> students</span>
            <div className={styles.teachers}>
                {teachers.map((teacher) => <Teacher key={teacher.id} {...teacher} />)}
                <span>Overseen by <b>{teachers.length} staff</b></span>
            </div>
        </div> 

        <div className={styles.meta}>
            <div className={styles.targets}>
                <span className={styles.targetEqual}><b>{targets.on}/{students}</b> on target</span>
                <span className={styles.targetAbove}><b>{targets.above}</b> above target</span>
                <span className={styles.targetBelow}><b>{targets.below}</b> below target</span>
            </div>

            <Link className={styles.linkTo} to={`/lessons/${id}`}>
                View class
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"></path></svg>            </Link>
        </div>
    </div>
}