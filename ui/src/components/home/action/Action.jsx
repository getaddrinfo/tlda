import styles from "./Action.module.scss";
import { Link } from "react-router-dom";

export const Action = ({
    title,
    description,
    url
}) => {
    return (
        <div className={styles.action}>
            <div className={styles.left}>
                <h2>{title}</h2>
                <p>
                    {description}
                </p>
            </div>

            <Link to={url}>
                <div className={styles.arrow}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill-rule="evenodd" d="M8.72 18.78a.75.75 0 001.06 0l6.25-6.25a.75.75 0 000-1.06L9.78 5.22a.75.75 0 00-1.06 1.06L14.44 12l-5.72 5.72a.75.75 0 000 1.06z"></path></svg>
                </div>
            </Link>
        </div>
    )
}