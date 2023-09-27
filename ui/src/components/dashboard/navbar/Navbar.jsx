import React from 'react';
import { NavLink } from 'react-router-dom'

import { useStore } from '../../../lib/store/internals';
import CurrentUserStore from '../../../lib/store/currentUser';

import styles from './Navbar.module.scss';
import { User } from '../user/User';

const URLS = [
    {
        path: "/upcoming-events",
        name: "Upcoming Events"
    },
    {
        path: "/lessons",
        name: "Lessons"
    },
    {
        path: "/teachers",
        name: "Teachers"
    },
    {
        path: "/assessments",
        name: "Assessments"
    }
]

export const Navbar = () => {
    const user = useStore(CurrentUserStore, (store) => store.getCurrentUser());

    return (
        <nav>
            <div className={styles.leftContent}>
                <img src="/branding/logo-full.png" className={styles.logo} />
                <ul>
                    {URLS.map(({ path, name}) => (
                        <li key={name.split(" ").join("")}>
                            <NavLink to={`/app${path}`} className={({ isActive }) => isActive ? styles.isActive : ""}>
                                {name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            <User user={user} />
        </nav>
    )
}

