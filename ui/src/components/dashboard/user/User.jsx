import React, { useState } from 'react';
import http from '../../../lib/http';
import Dispatcher from '../../../lib/store';
import { ActionTypes } from '../../../lib/store/internals';
import styles from './User.module.scss';

export const COLOUR_PAIRS = [
    ["#D0FFF7", "#95DBF1"],
    ["#E2E5FF", "#959EF1"],
    ["#FFE2F9", "#F195ED"],
];

// from https://gist.github.com/tmcw/7323807
export const hashCode = (str) => {
    let hash = 0x811C9DC5; // init

    for(let i = 0; i < str.length; i++) {
        hash = hash ^ str.charCodeAt(i);

        hash += (hash << 24) + (hash << 8) + (hash << 7) + (hash << 4) + (hash << 1);
    }

    return (hash >>> 0);
}

export const getColourFromId = (id) => {
    return COLOUR_PAIRS[hashCode(id) % COLOUR_PAIRS.length]
}

export const getInitials = (name) => {
    const split = name.split(" ")
    // eslint-disable-next-line
    const [firstName, firstSurname, ..._rest] = split

    return firstName[0] + firstSurname[0]
}


export const User = ({ user }) => {
    const [open, setOpen] = useState(false);

    if(!user) {
        return (
            <div className={styles.pending}>
                ...
            </div>
        )
    }

    const initials = getInitials(user.name)
    const [bg, fg] = getColourFromId(user.id);

    return (
        <div className={styles.profile}>
            <div className={styles.profilePicture} style={{backgroundColor: bg}} onClick={() => setOpen(!open)}>
                <span style={{color: fg}} className={styles.initials}>{initials}</span>
            </div>

            <div className={[styles.dropdownContent, open ? styles.visible : null].filter(Boolean).join(" ")}>
                <ul>
                    <li onClick={() => {
                        http.delete("/auth/session");
                        Dispatcher.dispatch({ type: ActionTypes.AUTH_LOGOUT })
                    }} className={styles.logout}>
                        Logout
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fillRule="evenodd" d="M3 3.25c0-.966.784-1.75 1.75-1.75h5.5a.75.75 0 010 1.5h-5.5a.25.25 0 00-.25.25v17.5c0 .138.112.25.25.25h5.5a.75.75 0 010 1.5h-5.5A1.75 1.75 0 013 20.75V3.25zm16.006 9.5l-3.3 3.484a.75.75 0 001.088 1.032l4.5-4.75a.75.75 0 000-1.032l-4.5-4.75a.75.75 0 00-1.088 1.032l3.3 3.484H10.75a.75.75 0 000 1.5h8.256z"></path></svg>
                    </li>
                </ul>
            </div>
        </div>
    )
}