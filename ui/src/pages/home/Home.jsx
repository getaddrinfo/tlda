import React from 'react';
import { Action } from "../../components/home";

import CurrentUserStore from '../../lib/store/currentUser';
import { useStore } from '../../lib/store/internals';

import styles from './Home.module.scss';

const ACTIONS = [
    {
        title: "View Classes",
        description: "View a list of your classes, some information about them, and who is involved.",
        url: "/app/lessons"
    },
    {
        title: "View Upcoming Events",
        description: "View a list of upcoming events such as progress reviews, performance reviews and watch requests from other teachers.",
        url: "/app/upcoming-events"
    },
    {
        title: "View Other Teachers",
        description: "View other teacher's classes, or request to watch a lesson.",
        url: "/app/teachers"
    },
    {
        title: "Manage Assessments",
        description: "Manage assessments of students on a per-class or per-year basis.",
        url: "/app/assessments"
    }
]

const Home = () => {
    const user = useStore(CurrentUserStore, (store) => store.getCurrentUser());

    if(!user) {
        return <></>
    }

    return (
        <div className={styles.home}>
            <div className={styles.hero}>
                <h1>Welcome home, {user.name}</h1>
                <p>
                    Check out the different things you can do below.
                </p>
            </div>

            <div className={styles.actions}>
                {ACTIONS.map((action) => <Action {...action} />)}
            </div>
        </div>
    )
}

export default Home;