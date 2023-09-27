import styles from "./RawStat.module.scss";

export const RawStat = ({ name, value }) => (
    <li className={styles.specificStat}>
        <h3>{name}</h3>
        <span>{value.toFixed(1)}</span>
    </li>
);