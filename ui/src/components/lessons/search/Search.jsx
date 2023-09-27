import LessonActionCreator from "../../../lib/actions/LessonsActionCreator";
import { useEffect, useState } from "react";
import styles from "./Search.module.scss";

export const Search = () => {
    const [content, setContent] = useState("");

    useEffect(() => {
        LessonActionCreator.filter(content)
    }, [content])

    return <form onSubmit={(event) => { event.preventDefault(); }}>
        <input type="text" className={styles.filter} value={content} placeholder="Filter" onChange={(event) => {
            event.preventDefault();
            setContent(event.target.value);
        }} />
    </form>
}