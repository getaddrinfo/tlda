import styles from "./Orb.module.scss";

export const Orb = ({
    highMark,
    lowMark
}) => {
    return <span className={[
        styles.orb,
        highMark ? styles.highMark : null,
        lowMark ? styles.lowMark : null
    ].filter(Boolean).join(" ")}>
        {highMark && <>High</>}
        {lowMark && <>Low</>}
    </span>
}