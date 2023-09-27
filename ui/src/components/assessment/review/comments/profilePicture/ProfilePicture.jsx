import { getInitials, getColourFromId } from "../../../../../lib/utils/teacher";
import styles from "./ProfilePicture.module.scss";

export const ProfilePicture = ({ id, name }) => {
    const initials = getInitials(name);
    const [bg, fg] = getColourFromId(id);

    return <div className={styles.profilePicture} style={{ backgroundColor: bg }}>
        <span style={{ color: fg }} className={styles.initials}>{initials}</span>
    </div>
}