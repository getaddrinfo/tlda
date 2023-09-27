import { getInitials, getColourFromId } from "../../../lib/utils/teacher";
import styles from "./Teacher.module.scss";
import { Link } from "react-router-dom";

export const Teacher = ({ id, name }) => {
    const initials = getInitials(name);
    const [bg, fg] = getColourFromId(id);

    return <Link to={`/app/teachers/${id}`}>
        <div className={styles.profilePicture} style={{backgroundColor: bg}}>
            <span style={{color: fg}} className={styles.initials}>{initials}</span>
        </div>
    </Link>
}