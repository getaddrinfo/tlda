import styles from "./Error.module.scss";

/**
 * 
 * @param {{
 *  item: string,
 *  touched: {[k: string]: boolean},
 *  errors: {[k: string]: string}
 * }} param0 
 * @returns {<></>}
 */
export const Error = ({
    item,
    touched,
    errors
}) => (
    errors[item] && touched[item] ? <span className={styles.validationError}>{errors[item]}</span> : <></>
)