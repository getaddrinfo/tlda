import styles from "./Tag.module.scss";

export const Tag = ({
    inner
}) => <span className={styles.tag}>{inner}</span>