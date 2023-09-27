import { useState } from "react";
import styles from "./Request.module.scss";
import { CLASSROOMS } from "../../../lib/statics";
import RequestsActionCreator from "../../../lib/actions/RequestsActionCreator";
import { Button } from "../../button/Button";

import { secsToTimeString } from "../../../lib/utils/time";

export const Request = ({
    id,
    length,
    meta,
    requester,
}) => {
    const [open, setOpen] = useState(false);
    const [location, setLocation] = useState(null);

    return <div className={styles.request}>
        <div className={styles.info}>
            <div className={styles.name}>
                <h1>{requester.name}</h1>
                <span>
                    ({secsToTimeString(length)})
                </span>
            </div>

            <p>
                {meta || "No extra info provided"}
            </p>
        </div>

        <div className={styles.actions}>
            <div className={styles.dropdown}>
                <div className={styles.dropdownContent} onClick={() => setOpen(!open)}>
                    {location ?? "Select"}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M12.78 6.22a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0L3.22 7.28a.75.75 0 011.06-1.06L8 9.94l3.72-3.72a.75.75 0 011.06 0z"></path></svg>
                </div>
                <ul className={[styles.choices, open ? styles.open : null].filter(Boolean).join(" ")}>
                    {CLASSROOMS.map((room) => <li onClick={() => {
                        setLocation(room);
                        setOpen(false);
                    }}>{room}</li>)}
                </ul>
            </div>

            <Button design="grey" size="small" onClick={() => {
                RequestsActionCreator.deleteRequest(id);
            }}>
                Dismiss
            </Button>
            <Button design="blurple" size="small" onClick={() => {
                if(!location) return;

                RequestsActionCreator.acceptRequest(id, {
                    location
                });
            }}>
                Accept    
            </Button> 
        </div>
    </div>
}